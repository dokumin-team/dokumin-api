/* eslint-disable no-useless-catch */
const { createPasswordReset, deletePasswordResetsByUserId, findPasswordResetsByUserId } = require("./model");
const UserCollection = require("../user/model"); // Firestore User collection
const hashData = require("../../util/hashData");
const verifyHashedData = require("../../util/verifyHashedData");
const sendEmail = require("../../util/sendEmail");
const { v4: uuidv4 } = require("uuid");

// Request Password Reset
const requestPasswordReset = async (email, redirectUrl) => {
  try {
    // Check if the user exists
    const userSnapshot = await UserCollection.where("email", "==", email).get();
    if (userSnapshot.empty) {
      throw Error("No account found with the provided email address!");
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    if (!user.verified) {
      throw Error("Your email address is not verified yet. Please check your inbox!");
    }

    // Send reset email
    await sendPasswordResetEmail({ id: userId, email: user.email }, redirectUrl);
  } catch (error) {
    throw error;
  }
};

// Send Password Reset Email
const sendPasswordResetEmail = async ({ id: userId, email }, redirectUrl) => {
  try {
    const resetString = uuidv4() + userId;

    // Delete existing password reset records for the user
    await deletePasswordResetsByUserId(userId);

    // Create a hashed reset string
    const hashedResetString = await hashData(resetString);

    // Save password reset record to Firestore
    await createPasswordReset({
      userId,
      resetString: hashedResetString,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
    });

    // Email content
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password.</p>
        <p>This link will <b>expire in 60 minutes</b>.</p>
        <p>Click <a href="${redirectUrl}/${userId}/${resetString}">here</a> to proceed.</p>
        <p>Team Dokumin ❤️</p>`,
    };

    // Send email
    await sendEmail(mailOptions);
  } catch (error) {
    throw error;
  }
};

// Reset User Password
const resetUserPassword = async (userId, resetString, newPassword) => {
  try {
    // Retrieve password reset records for the user
    const passwordResets = await findPasswordResetsByUserId(userId);
    if (!passwordResets.length) {
      throw Error("Password reset request not found. Please request a new reset!");
    }

    const { resetString: hashedResetString, expiresAt } = passwordResets[0];

    // Check if the reset link has expired
    if (new Date(expiresAt) < new Date()) {
      await deletePasswordResetsByUserId(userId);
      throw Error("Your password reset link has expired. Please request a new one!");
    }

    // Verify the reset string
    const stringMatch = await verifyHashedData(resetString, hashedResetString);
    if (!stringMatch) {
      throw Error("The provided password reset details are incorrect!");
    }

    // Hash the new password and update it in the user record
    const hashedNewPassword = await hashData(newPassword);
    const userRef = UserCollection.doc(userId);
    await userRef.update({ password: hashedNewPassword });

    // Delete password reset record after successful password change
    await deletePasswordResetsByUserId(userId);
  } catch (error) {
    throw error;
  }
};

module.exports = { requestPasswordReset, resetUserPassword };
