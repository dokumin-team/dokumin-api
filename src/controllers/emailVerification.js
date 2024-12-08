const Firestore = require('@google-cloud/firestore');
const generateOTP = require("../utils/generateOTP");
const verifyHashedData = require("../utils/verifyHashedData");
const hashData = require("../utils/hashData");
const sendEmail = require("../utils/sendEmail");

const serviceAccount = require('./../../serviceaccountkey.json');
// console.log(serviceAccount);

const db = new Firestore({
    projectId: serviceAccount.project_id,
    keyFilename: './serviceaccountkey.json',
});
// console.log(db);

module.exports.sendOTPVerificationEmail = async (req, res) => {
    console.log("Sending OTP Verification Email...")
    const _id = req.users.userDocId;
    console.log(_id);
    if (!_id) {
        console.log("token _id:", _id);
        throw new Error("_id is empty");
    }
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Missing required parameters: email" });
        }

        const otp = await generateOTP();
        console.log("Generated OTP:", otp);

        // Email options
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email Address",
            html: `
        <p>Enter <b>${otp}</b> to complete your account setup and login.</p>
        <p>This code <b>expires in 15 minutes</b>.</p>
        <p>Team Dokumin ❤️</p>
      `,
        };

        const hashedOTP = await hashData(otp);

        const verificationRecord = {
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 900000, // 15minutes 
        };

        // Save OTP verification to Firestore
        const verificationRef = db.collection("userOTPVerifications").doc('_id');
        await verificationRef.set(verificationRecord);

        // Send email
        await sendEmail(mailOptions);
        console.log("Email sent successfully!");

    } catch (error) {
        console.error("Error sending OTP verification email:", error.message);
        res.status(500).json({
            error: true,
            message: "An error occurred during sending OTP verification email. Please try again later.",
        });
    }
};

module.exports.verifyOTPEmail = async (req, res, next) => {
    const userId = req.users.userDocId;
    const { OTP: userOTP } = req.body;
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);

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
            await verificationRef.delete(); // Hapus data OTP kedaluwarsa
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
            console.log('User verified successfull!')
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
        console.log("Generated Resend OTP:", otp)

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
            expiresAt: Date.now() + 3600000, // 1 hour
        };

        await verificationRef.set(verificationRecord);
        const emailData = verificationRecord;
        await sendEmail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: "Resend OTP successfully",
            data: emailData,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};
