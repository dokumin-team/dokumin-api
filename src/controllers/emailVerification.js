const Firestore = require("@google-cloud/firestore");
const generateOTP = require("../utils/generateOTP");
const verifyHashedData = require("../utils/verifyHashedData");
const hashData = require("../utils/hashData");
const sendEmail = require("../utils/sendEmail");

const serviceAccount = require("./../../serviceaccountkey.json");

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.verifyOTPEmail = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { OTP: userOTP } = req.body;
  try {
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);

    const verificationRef = db.collection("userOTPVerifications").doc(userId);
    const doc = await verificationRef.get();

    if (!doc.exists) {
      throw new Error("No verification record found");
    }

    console.log("Verification Document Data:", doc.data());
    const { expiresAt, otp: hashedOTP } = doc.data();

    if (!userOTP || !hashedOTP) {
      throw new Error("Missing OTP or hashed OTP data for verification.");
    }

    // Periksa apakah OTP telah kedaluwarsa
    if (expiresAt < Date.now()) {
      await verificationRef.delete();
      throw new Error("The OTP code has expired. Please request a new one.");
    }

    // Verifikasi OTP
    console.log("Unhashed OTP:", userOTP);
    console.log("Hashed OTP:", hashedOTP);
    const isValid = await verifyHashedData(userOTP, hashedOTP);
    if (!isValid) {
      throw new Error("Invalid OTP. Please check your inbox and try again.");
    }

    // Tandai pengguna sebagai terverifikasi
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("User not found.");
    }

    const verified = userDoc.data().verified;

    if (verified) {
      throw new Error("User is already verified.");
    } else {
      await userRef.update({ verified: true });
      console.log("User verified successfull!");
    }

    // Hapus data OTP setelah berhasil diverifikasi
    await verificationRef.delete();

    res.status(200).json({
      success: true,
      message: "User verified and registration completed successfully.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports.resendOTPVerificationEmail = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { email } = req.body;
  try {
    // Checking if user already verified
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error("User not found.");
    }
    if (userDoc.data().verified) {
      return "User already verified.";
    }

    const verificationRef = db.collection("userOTPVerifications").doc(userId);
    await verificationRef.delete();

    console.log("Resending Email Verification...");
    const otp = await generateOTP();
    console.log("Generated Resend OTP:", otp);

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
      userId: userId,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    };

    await verificationRef.set(verificationRecord);
    const emailData = verificationRecord;
    await sendEmail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "Resend OTP successfully",
      data: emailData,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
