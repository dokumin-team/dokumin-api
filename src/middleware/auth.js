const jwt = require("jsonwebtoken");

module.exports.authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header
  if (!token) {
    return res.status(401).json({
      status: "FAILED",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.users = decoded; // Sisipkan data pengguna ke `req`
    next();
  } catch (error) {
    res.status(401).json({
      status: "FAILED",
      message: (error, "Invalid token."),
    });
  }
};
