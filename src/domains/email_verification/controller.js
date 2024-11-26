const UserVerificationCollection = require("./model");
const UserCollection = require("./../user/model");
const hashData = require("../../util/hashData");
const sendEmail = require("../../util/sendEmail");
const currentUrl = require("../../util/currentUrl");
const verifyHashedData = require("../../util/verifyHashedData");
const { v4: uuidv4 } = require("uuid");

const sendVerificationEmail = async ({ id, email }) => {
  try {
    const uniqueString = uuidv4() + id;

    // Hash the unique string
    const hashedUniqueString = await hashData(uniqueString);

    // Create a new verification record in Firestore
    await UserVerificationCollection.doc(id).set({
      userId: id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000, // 6 hours
    });

    // Email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email Address",
      html: `<p>To complete your registration and start using your account, please verify your email address.</p>
             <p>The verification link will <b>expire in 6 hours</b>.</p>
             <p>Click <a href="${currentUrl}email_verification/${id}/${uniqueString}">here</a> to verify your email.</p>
             <p>Team Dokumin ❤️</p>`,
    };

    await sendEmail(mailOptions);
    return { userId: id, email };
  } catch (error) {

    console.log(error);
    throw error;
  }
};

const verifyEmail = async (userId, uniqueString) => {
  try {
    // Fetch the verification record from Firestore
    const verificationDoc = await UserVerificationCollection.doc(userId).get();

    if (!verificationDoc.exists) {
      throw Error(
        "It looks like your account doesn't exist or has already been verified. Please either sign up or log in!"
      );
    }

    const { uniqueString: hashedUniqueString, expiresAt } = verificationDoc.data();

    // Check for expiration
    if (expiresAt < Date.now()) {
      await UserVerificationCollection.doc(userId).delete();
      await UserCollection.doc(userId).delete(); // Delete user if verification expired
      throw Error("This verification link has expired. Please sign up again!");
    }

    // Check if the unique string matches
    const stringMatch = await verifyHashedData(uniqueString, hashedUniqueString);
    if (!stringMatch) {
      throw Error("The verification details are invalid. Please try again.");
    }

    // Mark user as verified
    await UserCollection.doc(userId).update({ verified: true });

    // Delete the verification record
    await UserVerificationCollection.doc(userId).delete();

    return { userId };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const resendVerificationEmail = async (userId, email) => {
  try {
    // Delete existing verification records
    await UserVerificationCollection.doc(userId).delete();

    // Resend verification email
    const emailData = await sendVerificationEmail({ id: userId, email });
    return emailData;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, verifyEmail, resendVerificationEmail };