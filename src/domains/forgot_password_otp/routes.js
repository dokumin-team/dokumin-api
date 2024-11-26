const express = require("express");
const router = express.Router();
const {
  requestOTPPasswordReset,
  resetOTPUserPassword,
  resendOTPPasswordResetEmail,
} = require("./controller");

router.post("/request", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required!");

    const emailData = await requestOTPPasswordReset(email);
    res.status(200).json({
      status: "PENDING",
      message: "Password reset OTP email sent!",
      data: emailData,
    });
  } catch (error) {
    res.status(400).json({ status: "FAILED", message: error.message });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword)
      throw new Error("All fields are required!");

    await resetOTPUserPassword(userId, otp, newPassword);
    res.status(200).json({
      status: "SUCCESS",
      message: "Password has been reset successfully!",
    });
  } catch (error) {
    res.status(400).json({ status: "FAILED", message: error.message });
  }
});

router.post("/resend", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email)
      throw new Error("Both userId and email are required!");

    const emailData = await resendOTPPasswordResetEmail(userId, email);
    res.status(200).json({
      status: "PENDING",
      message: "Password reset OTP email sent!",
      data: emailData,
    });
  } catch (error) {
    res.status(400).json({ status: "FAILED", message: error.message });
  }
});

module.exports = router;
