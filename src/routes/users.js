const express = require("express");
const router = express.Router({ mergeParams: true });

const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const { authenticate } = require("../middleware/auth");

router.route("/signup").post(catchAsync(users.signup));
router.route("/signin").post(catchAsync(users.signin));
router.route("/logout").post(catchAsync(users.logout));
router.route("/profile").get(authenticate, catchAsync(users.getProfile));

module.exports = router;
