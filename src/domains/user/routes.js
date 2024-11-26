const express = require("express");
const router = express.Router();

// Custom functions
const { createNewUser, authenticateUser } = require("./controller");
const {
  sendOTPVerificationEmail,
} = require("../email_verification_otp/controller");
const authenticate = require("../../middleware/auth");
const UserCollection = require("./model");
const { generateToken } = require("../../util/jwt");

// Signup
router.post("/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (name) name = name.trim();
    if (email) email = email.trim();
    if (password) password = password.trim();

    if (name === "" || email === "" || password === "") {
      throw Error("Please fill in all fields!");
    } else if (!/^[a-zA-ZÀ-ÿ ]+$/.test(name)) {
      throw Error("The name you entered is invalid!");
    } else if (!/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      throw Error("The email format is invalid!");
    } else if (password.length < 8) {
      throw Error("Password must be at least 8 characters long!");
    }

    const newUser = await createNewUser({ name, email, password });
    const emailData = await sendOTPVerificationEmail(newUser);

    res.status(200).json({
      status: "PENDING",
      message: "A verification email has been sent to your email address!",
      data: emailData,
    });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
});


// Signin
router.post("/signin", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email === "" || password === "") {
      throw Error("Both email and password are required!");
    }

    const authenticatedUser = await authenticateUser(email, password);

    // Generate JWT
    const token = generateToken({ id: authenticatedUser.id });

    res.status(200).json({
      status: "SUCCESS",
      message: "You have successfully signed in!",
      token,
      data: authenticatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
});

router.get("/profile", authenticate, async (req, res) => {
  try {
    // Fetch user document by ID (extracted from JWT in middleware)
    const userDoc = await UserCollection.doc(req.users.userId).get();

    if (!userDoc.exists) {
      throw new Error("User not found!");
    }

    // Exclude sensitive data (like password)
    const userData = userDoc.data();
    delete userData.password;

    res.status(200).json({
      status: "SUCCESS",
      message: "User profile fetched successfully!",
      data: { id: userDoc.id, ...userData },
    });
  } catch (error) {
    res.status(400).json({
      status: "FAILED",
      message: error.message,
    });
  }
});

module.exports = router;
