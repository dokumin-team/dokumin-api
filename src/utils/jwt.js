const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, expiresIn) => {
  console.log("Payload for Token:", payload);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

module.exports = { generateToken };
