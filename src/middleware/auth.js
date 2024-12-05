const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token from client:", token);

  if (!token) {
    return res.status(401).json({
      status: "FAILED",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    if (!decoded || !decoded._id) {
      return res.status(401).json({
        status: "FAILED",
        message: "Invalid token: Missing or invalid payload.",
      });
    }

    req.users = { userDocId: decoded._id };
    console.log("Decoded UserId:", req.users);

    if (!req.users) {
      return res.status(401).json({
        status: "FAILED",
        message: "Invalid token: Missing userID.",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      status: "FAILED",
      message: (error, "Invalid token."),
    });
  }
};
