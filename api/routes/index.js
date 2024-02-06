var express = require("express");
var router = express.Router();

/* GET home page. */
router.post("/", function async(req, res, next) {
  res.send({ body: "Hello world" });
});

module.exports = router;
