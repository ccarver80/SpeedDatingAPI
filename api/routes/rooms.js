var express = require("express");
var router = express.Router();
var zipcodes = require("zipcodes");
const { PrismaClient, Prisma } = require("@prisma/client");
const { verifyToken } = require("../middleware/verify");

const prisma = new PrismaClient();

router.post("/searchRooms", async (req, res) => {
  try {
    var rad = zipcodes.radius(req.body.zipcode, req.body.miles);

    const rooms = await prisma.room.findMany({
      where: {
        room_zipcode: { in: rad },
      },
    });
    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
  }
});

router.post("/createRoom", async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: {
        room_name: req.body.room_name,
        room_description: req.body.room_description,
        room_zipcode: req.body.room_zipcode,
      },
    });

    res.status(201).json(room);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
