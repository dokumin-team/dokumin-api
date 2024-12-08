const express = require("express");
const router = express.Router({ mergeParams: true });

const forgotPassword = require("../controllers/forgotPassword");
const catchAsync = require("../utils/catchAsync");
// const { authenticate } = require('../middleware/auth');

router
  .route("/request")
  .post(catchAsync(forgotPassword.requestOTPPasswordReset));
router.route("/reset").post(catchAsync(forgotPassword.resetUserPassword));
router.route("/resend").post(catchAsync(forgotPassword.resendOTPPasswordReset));

module.exports = router;
