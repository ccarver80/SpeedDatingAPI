var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var zipcodes = require("zipcodes");
const auth = require("basic-auth");
const { PrismaClient, Prisma } = require("@prisma/client");
const { verifyToken } = require("../middleware/verify");

const prisma = new PrismaClient();

//###############################################
//
//        Users
//
//###############################################

/*
      GET ROUTES
*/

router.get("/user/:id", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        rec_id: parseInt(req.params.id),
      },
    });

    res.status(200).json({
      user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/genders", async (req, res) => {
  try {
    const genders = await prisma.gender.findMany();
    genders.map((gender) => (gender.value = gender.rec_id));

    res.status(200).json(genders);
  } catch (err) {
    console.log(err);
  }
});

router.get("/seeking", async (req, res) => {
  try {
    const seeking = await prisma.seeking.findMany();
    seeking.map((seek) => (seek.value = seek.rec_id));

    res.status(200).json(seeking);
  } catch (err) {
    console.log(err);
  }
});
/* 
    POST ROUTES
*/

router.post("/verify", verifyToken, async (req, res) => {
  res.status(201).json({ Message: "Verifing token" });
});

router.post("/login", async (req, res, next) => {
  const creds = auth(req);
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: creds.name,
      },
    });
    if (user) {
      const authenticate = bcrypt.compareSync(creds.pass, user.password);
      if (authenticate) {
        jwt.sign(
          { user: user },
          "secretkey",
          { expiresIn: "4h" },
          (err, token) => {
            res
              .status(201)
              .json({ token, user_id: user.rec_id, user_name: user.username });
          }
        );
      } else {
        res
          .status(500)
          .json({ message: "Sorry incorrect password or username" });
      }
    } else {
      res.status(500).json({ message: "Sorry that username dose not exist." });
      console.log();
    }
  } catch (err) {}
});

router.post("/signup", async (req, res, next) => {
  try {
    const zipcode = req.body.zipcode;
    const valid = zipcodes.lookup(zipcode);

    if (valid != undefined) {
      if (req.body.opt_in === "true") {
        req.body.opt_in = true;
      } else {
        req.body.opt_in = false;
      }
      const user = await prisma.user.create({
        data: {
          username: req.body.username,
          password: req.body.password,
          gender: {
            connect: {
              rec_id: parseInt(req.body.gender),
            },
          },
          seeking: {
            connect: {
              rec_id: parseInt(req.body.seeking),
            },
          },
          zipcode: parseInt(zipcode),
          email: req.body.email,
          opt_in: req.body.opt_in,
        },
      });
      jwt.sign(
        { user: user },
        "secretkey",
        { expiresIn: "4h" },
        (err, token) => {
          res
            .status(201)
            .json({ token, user_id: user.rec_id, user_name: user.username });
        }
      );
    } else {
      res.status(200).json({
        zipcode: `Zipcode ${zipcode} Dose Not Exist, Please Try Again`,
      });
    }
  } catch (err) {
    console.log(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.log("PRISMA ERROR");
    }
    console.log("ERROR: ");
    console.log(err.message);
    if (err.meta.target) {
      res.status(500).send({ error: err.meta.target });
    } else {
      res.status(500).send({ error: err });
    }
  }
});

router.post("/logout", async (req, res) => {
  try {
    console.log("LOGGED OUT!!!!");
  } catch (error) {
    console.log(error);
  }
});

/*
    PUT ROUTES
*/

router.put("/editProfile", async (req, res) => {
  try {
    const updateProfile = await prisma.user.update({
      where: {
        rec_id: parseInt(req.body.id),
      },
      data: {
        location: req.body.location,
        bio: req.body.bio,
        hobbies: req.body.hobbies,
      },
    });

    res.status(201).json({
      message: "Profile Update Successfully",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
