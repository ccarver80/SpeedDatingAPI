"use strict";
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  if (req.body.token) {
    try {
      jwt.verify(req.body.token, "secretkey", (err, authData) => {
        if (err) {
          res.sendStatus(403).json({ err: err });
        } else {
          res.status(200);
          next();
        }
      });
    } catch (err) {
      res.status(500);
    }
  }
};

exports.verifyToken = verifyToken;
