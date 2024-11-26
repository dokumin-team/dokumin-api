const { db } = require("../../util/firestore");

/**
 * Create a new OTP document in Firestore.
 */
const createPasswordResetOTP = async ({
  userId,
  otp,
  createdAt,
  expiresAt,
}) => {
  const otpData = { userId, otp, createdAt, expiresAt };
  const otpRef = await db.collection("passwordResetOTPs").add(otpData);
  return { id: otpRef.id, ...otpData };
};

/**
 * Retrieve an OTP record by userId.
 */
const getPasswordResetOTPByUserId = async (userId) => {
  const otpQuery = db
    .collection("passwordResetOTPs")
    .where("userId", "==", userId)
    .limit(1);
  const otpSnapshot = await otpQuery.get();
  if (otpSnapshot.empty) return null;

  const otpDoc = otpSnapshot.docs[0];
  return { id: otpDoc.id, ...otpDoc.data() };
};

/**
 * Delete all OTP records for a specific userId.
 */
const deletePasswordResetOTPsByUserId = async (userId) => {
  const otpQuery = db
    .collection("passwordResetOTPs")
    .where("userId", "==", userId);
  const otpSnapshot = await otpQuery.get();

  const batch = db.batch();
  otpSnapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
};

/**
 * Delete a specific OTP record by its document ID.
 */
const deletePasswordResetOTPById = async (otpId) => {
  const otpRef = db.collection("passwordResetOTPs").doc(otpId);
  await otpRef.delete();
};

module.exports = {
  createPasswordResetOTP,
  getPasswordResetOTPByUserId,
  deletePasswordResetOTPsByUserId,
  deletePasswordResetOTPById,
};
