const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (payload, expiresIn) => {
  console.log("Payload for Token:", payload);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
};

module.exports = { generateToken, verifyToken };
