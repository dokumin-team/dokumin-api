const Firestore = require("@google-cloud/firestore");
const serviceAccount = require("./../../serviceaccountkey.json");
const generateOTP = require("../utils/generateOTP");
const verifyHashedData = require("../utils/verifyHashedData");
const hashData = require("../utils/hashData");
const sendEmail = require("../utils/sendEmail");

// console.log(serviceAccount);

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});
// console.log(db);

module.exports.requestOTPPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Email is required!");

    const userRef = db.collection("users").where("email", "==", email).limit(1);
    const userSnapshot = await userRef.get();
    // console.log(userSnapshot);

    if (userSnapshot.empty) {
      throw new Error("No account with the supplied email exists!");
    }

    const user = userSnapshot.docs[0];
    const userData = user.data();

    if (!userData.verified) {
      throw new Error("Email hasn't been verified yet. Check your inbox!");
    }

    const otp = generateOTP();
    const hashedOTP = await hashData(otp);

    // Remove existing OTPs for this user
    const verificationRef = db.collection("forgotPasswordOTPs").doc(email);
    await verificationRef.delete();

    // Create a new OTP record
    const newOtpData = {
      userId: user.id,
      otp: hashedOTP,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
    };
    await verificationRef.set(newOtpData);

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

    res.status(200).json({
      status: "PENDING",
      message: "Password reset OTP email sent!",
    });
  } catch (error) {
    res.status(400).json({ status: "FAILED", message: error.message });
    next(error);
  }
};

module.exports.resetUserPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new Error("All fields are required!");
    }

    const otpRef = db.collection("forgotPasswordOTPs").doc(email);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      console.log("No OTP found for email:", email);
      throw new Error("Password reset request not found!");
    }

    const otpData = otpDoc.data();

    const currentTime = new Date();
    if (otpData.expiresAt.toDate() < currentTime) {
      console.log("OTP expired for email:", email);
      await otpRef.delete(); // Hapus OTP yang sudah kedaluwarsa
      throw new Error("Code has expired. Please request again!");
    }

    const isOtpValid = await verifyHashedData(otp, otpData.otp);
    if (!isOtpValid) {
      throw new Error("Invalid code passed. Check your inbox!");
    }

    const hashedPassword = await hashData(newPassword);

    const userRef = db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    const userSnapshot = await userRef;

    if (userSnapshot.empty) {
      throw new Error("User not found!");
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    await db
      .collection("users")
      .doc(userId)
      .update({ password: hashedPassword });

    await otpRef.delete();

    console.log("Password Reset Succesfully!");

    res.status(200).json({
      status: "SUCCESS",
      message: "Password has been reset successfully!",
    });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(400).json({ status: "FAILED", message: error.message });
    next(error);
  }
};

module.exports.resendOTPPasswordReset = async (req, res, next) => {
  const { email } = req.body;
  try {
    const verificationRef = db.collection("forgotPasswordOTPs").doc(email);
    await verificationRef.delete();

    const emailData = await module.exports.requestOTPPasswordReset(
      {
        body: { email },
      },
      res,
      next,
    );

    res.status(200).json({
      status: "PENDING",
      message: "Resend OTP reset password succesfully",
      data: emailData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
