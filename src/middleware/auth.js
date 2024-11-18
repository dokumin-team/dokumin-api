const { verifyToken } = require("../util/jwt");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "FAILED",
      message: "Access denied! No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Save user data from token
    next();
  } catch (error) {
    res.status(401).json({
      status: "FAILED",
      message: "Invalid or expired token!",
    });
  }
};

module.exports = authenticate;
