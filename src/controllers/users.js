const admin = require("firebase-admin");
const Firestore = require("@google-cloud/firestore");
const hashData = require("../utils/hashData");
const { generateToken } = require("../utils/jwt");
const verifyHashedData = require("../utils/verifyHashedData");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

require("dotenv").config();

const serviceAccount = require("./../../serviceaccountkey.json");

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.signup = async (req, res) => {
  try {
    console.log("Checking Signup Request...");

    const { email, password, name } = req.body;

    // Validasi input
    if (!email || !password || !name) {
      throw new Error("Please fill in all fields!");
    }
    if (!/^[a-zA-ZÀ-ÿ ]+$/.test(name)) {
      throw new Error("The name you entered is invalid!");
    }
    if (!/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw new Error("The email format is invalid!");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long!");
    }

    const userCollection = db.collection("users");

    const existingUserSnapshot = await userCollection
      .where("email", "==", email)
      .get();
    if (!existingUserSnapshot.empty) {
      throw new Error("Email already in use.");
    } else {
      console.log("Email ready to use!");
    }

    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    const hashedPassword = await hashData(password);

    await userCollection.doc(userRecord.uid).set({
      email: email,
      name: name,
      password: hashedPassword,
      verified: false,
      userId: userRecord.uid,
    });

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      throw new Error("Email is incorrect.");
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    console.log("Full User Object:", user);
    console.log("Document ID:", user.id);

    console.log("User ID for Token Generation:", user.id);
    const token = generateToken({ _id: user.id }, "15m");
    console.log("Generated Token:", token);

    const otp = await generateOTP();
    console.log("Generated OTP:", otp);
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
      userId: user.id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 900000, // 15minutes
    };

    const verificationRef = db.collection("userOTPVerifications").doc(user.id);
    await verificationRef.set(verificationRecord);

    await sendEmail(mailOptions);
    console.log("Email sent successfully!");

    res.status(201).json({
      error: false,
      success: true,
      token,
      message:
        "Registration initiated. A verification email has been sent to your email address",
    });
  } catch (error) {
    console.error("Error during signup:", error.message);
  }
};

module.exports.signin = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Validasi input
    email = email.trim();
    password = password.trim();
    if (!email || !password) {
      throw new Error("Both email and password are required!");
    }

    // Ambil data pengguna berdasarkan email
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      throw new Error("Email or password is incorrect!");
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    console.log("Full User Object:", user);
    console.log("Document ID:", user.id);
    console.log("User UID:", user.uid);

    if (!user.verified) {
      throw new Error("Email has not been verified yet. Check your inbox!");
    }

    const isPasswordValid = await verifyHashedData(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email or password is incorrect!");
    }

    console.log("User ID for Token Generation:", user.id);
    const token = generateToken({ _id: user.id }, "30d");
    console.log("Generated Token:", token);

    res.status(200).json({
      status: "SUCCESS",
      message: "You have successfully signed in!",
      token,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
};

module.exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      error: false,
      message: "Logout successful!",
    });

    console.log("Logout successful");
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during logout.",
      error: (true, error.message),
    });
  }
};

module.exports.getProfile = async (req, res) => {
  const id = req.users.userDocId;
  try {
    console.log("Document ID for Query:", id);

    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: true,
        message: "User Document not found",
      });
    }

    let userData = null;
    let userId = null;

    snapshot.forEach((doc) => {
      if (doc.id === id) {
        userData = doc.data();
        userId = doc.id;

        delete userData.password;

        console.log(doc.id, "=>", userData);
      }
    });

    if (!userData) {
      return res.status(404).json({
        error: true,
        message: "User Document not found",
      });
    }

    res.status(200).json({
      status: "SUCCESS",
      message: "User profile fetched successfully!",
      data: {
        id: userId,
        ...userData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
};
