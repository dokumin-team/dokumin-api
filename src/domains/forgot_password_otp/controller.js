/* eslint-disable no-useless-catch */
const db = require("../../app");
const hashData = require("../../utils/hashData");
const verifyHashedData = require("../../utils/verifyHashedData");
const sendEmail = require("../../utils/sendEmail");
const generateOTP = require("../../utils/generateOTP");

const requestOTPPasswordReset = async (email) => {
  try {
    // Check if the user exists
    const userRef = db.collection("users").where("email", "==", email).limit(1);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      throw new Error("No account with the supplied email exists!");
    }

    const user = userSnapshot.docs[0];
    const userData = user.data();

    if (!userData.verified) {
      throw new Error("Email hasn't been verified yet. Check your inbox!");
    }

    return await sendOTPPasswordResetEmail(user.id, userData.email);
  } catch (error) {
    throw error;
  }
};

const sendOTPPasswordResetEmail = async (userId, email) => {
  try {
    const otp = generateOTP();
    const hashedOTP = await hashData(otp);

    // Remove existing OTPs for this user
    const otpRef = db
      .collection("passwordResetOTPs")
      .where("userId", "==", userId);
    const otpSnapshot = await otpRef.get();

    const batch = db.batch();
    otpSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // Create a new OTP record
    const newOtpData = {
      userId,
      otp: hashedOTP,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
    };

    await db.collection("passwordResetOTPs").add(newOtpData);

    // Send the OTP email
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Password Reset",
      html: `
        <p>Enter <b>${otp}</b> in the app to reset your password.</p>
        <p>This code <b>expires in 60 minutes</b>.</p>
        <p>Team Dokumin ❤️</p>
      `,
    };

    await sendEmail(mailOptions);

    return { userId, email };
  } catch (error) {
    throw error;
  }
};

const resetUserPassword = async (userId, otp, newPassword) => {
  try {
    // Get OTP record for the user
    const otpRef = db
      .collection("passwordResetOTPs")
      .where("userId", "==", userId)
      .limit(1);
    const otpSnapshot = await otpRef.get();

    if (otpSnapshot.empty) {
      throw new Error("Password reset request not found!");
    }

    const otpRecord = otpSnapshot.docs[0];
    const otpData = otpRecord.data();

    if (otpData.expiresAt.toDate() < new Date()) {
      await otpRecord.ref.delete();
      throw new Error("Code has expired. Please request again!");
    }

    const isOtpValid = await verifyHashedData(otp, otpData.otp);
    if (!isOtpValid) {
      throw new Error("Invalid code passed. Check your inbox!");
    }

    const hashedPassword = await hashData(newPassword);
    const userRef = db.collection("users").doc(userId);

    await userRef.update({ password: hashedPassword });
    await otpRecord.ref.delete();
  } catch (error) {
    throw error;
  }
};

const resendOTPPasswordResetEmail = async (userId, email) => {
  try {
    // Delete existing OTP records and resend
    const otpRef = db
      .collection("passwordResetOTPs")
      .where("userId", "==", userId);
    const otpSnapshot = await otpRef.get();

    const batch = db.batch();
    otpSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return await sendOTPPasswordResetEmail(userId, email);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  requestOTPPasswordReset,
  resetUserPassword,
  resendOTPPasswordResetEmail,
};
