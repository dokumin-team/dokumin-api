const express = require("express");
const router = express.Router();
const { verifyOTPEmail, resendOTPVerificationEmail } = require("./controller");

// Verify OTP
router.post("/verifyOTP", async (req, res) => {
  try {
    const { userId, OTP } = req.body;
    if (!userId || !OTP) throw Error("User details cannot be empty.");

    await verifyOTPEmail(userId, OTP);
    res.status(200).json({
      status: "VERIFIED",
      message: "Your email has been successfully verified. Welcome aboard!",
    });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// Resend OTP
router.post("/resend", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) throw Error("User details cannot be empty.");

    const emailData = await resendOTPVerificationEmail(userId, email);
    res.status(200).json({
      status: "PENDING",
      message: "A new verification email with the OTP has been sent.",
      data: emailData,
    });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
});

module.exports = router;
