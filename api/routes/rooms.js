var express = require("express");
var router = express.Router();
var zipcodes = require("zipcodes");
const { PrismaClient, Prisma } = require("@prisma/client");
const { verifyToken } = require("../middleware/verify");

const prisma = new PrismaClient();

router.get("/getRoom/:id", async (req, res) => {
  try {
    const room = await prisma.room.findFirst({
      where: {
        rec_id: parseInt(req.params.id),
      },
      include: {
        users: true,
      },
    });

    res.status(200).json(room);
  } catch (err) {
    console.log(err);
  }
});

router.post("/searchRooms", async (req, res) => {
  try {
    var rad = zipcodes.radius(req.body.zipcode, req.body.miles);
    console.log(req.body);
    const user = await prisma.user.findFirst({
      where: {
        rec_id: parseInt(req.body.userId),
      },
      include: {
        gender: true,
        seeking: true,
      },
    });

    const rooms = await prisma.room.findMany({
      include: {
        users: true,
      },
      where: {
        room_zipcode: { in: rad },
        users: {
          every: {
            gender: {
              name: user.seeking.name,
            },
            seeking: {
              name: user.gender.name,
            },
          },
        },
      },
    });

    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
  }
});

router.post("/createRoom", async (req, res) => {
  try {
    const zipcode = req.body.room_zipcode;
    const valid = zipcodes.lookup(zipcode);

    if (valid != undefined) {
      const lookup = zipcodes.lookup(zipcode);

      const room = await prisma.room.create({
        data: {
          room_name: req.body.room_name,
          room_description: req.body.room_description,
          room_zipcode: req.body.room_zipcode,
          room_city: lookup.city,
          room_state: lookup.state,
          room_country: lookup.country,
        },
      });
      res.status(201).json(room);
    } else {
      res
        .status(200)
        .json({ message: "Zipcode Dose Not Exist, Please Try Again" });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
