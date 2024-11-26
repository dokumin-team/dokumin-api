const db = require("./model");
const generateOTP = require("../../util/generateOTP");
const verifyHashedData = require("../../util/verifyHashedData");
const hashData = require("../../util/hashData");
const sendEmail = require("../../util/sendEmail");

const sendOTPVerificationEmail = async ({ _id, email }) => {
  try {
    const otp = await generateOTP();

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <p>Enter <b>${otp}</b> to complete your account setup and login.</p>
        <p>This code <b>expires in 60 minutes</b>.</p>
        <p>Team Dokumin ❤️</p>
      `,
    };

    const hashedOTP = await hashData(otp);
    const verificationRecord = {
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    // Save OTP verification to Firestore
    const verificationRef = db.collection("userOTPVerifications").doc(_id);
    await verificationRef.set(verificationRecord);

    // Send email
    await sendEmail(mailOptions);
    return {
      userId: _id,
      email,
    };
  } catch (error) {

    console.log(error);
    throw error;
  }
};

const verifyOTPEmail = async (userId, otp) => {
  try {
    const verificationRef = db.collection("userOTPVerifications").doc(userId);
    const doc = await verificationRef.get();

    if (!doc.exists) {
      throw Error("No verification record found or already verified.");
    }

    const { expiresAt, otp: hashedOTP } = doc.data();

    // Check expiration
    if (expiresAt < Date.now()) {
      await verificationRef.delete();
      throw Error("The OTP code has expired. Please request a new one.");
    }

    // Verify OTP
    const isValid = await verifyHashedData(otp, hashedOTP);
    if (!isValid) {
      throw Error("Invalid OTP. Please check your inbox and try again.");
    }

    // Mark user as verified
    const userRef = db.collection("users").doc(userId);
    await userRef.update({ verified: true });

    // Delete OTP verification record
    await verificationRef.delete();
    return { message: "User verified successfully!" };
  } catch (error) {

    console.log(error);
    throw error;
  }
};

const resendOTPVerificationEmail = async (userId, email) => {
  try {
    const verificationRef = db.collection("userOTPVerifications").doc(userId);
    await verificationRef.delete(); // Remove old records

    // Send new OTP
    const emailData = await sendOTPVerificationEmail({ _id: userId, email });
    return emailData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  verifyOTPEmail,
  sendOTPVerificationEmail,
  resendOTPVerificationEmail,
};
