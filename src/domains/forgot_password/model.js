const db = require("../../config/db"); // Firestore instance

// Function to create a new password reset request
async function createPasswordReset({ userId, resetString, createdAt, expiresAt }) {
  try {
    const resetRef = db.collection("passwordResets").doc(); // Create a new document
    await resetRef.set({
      userId,
      resetString,
      createdAt,
      expiresAt,
    });
    return resetRef.id; // Return the ID of the created document
  } catch (error) {
    console.error("Error creating password reset:", error);
    throw error;
  }
}

// Function to delete password reset records for a user
async function deletePasswordResetsByUserId(userId) {
  try {
    const resetSnapshots = await db
      .collection("passwordResets")
      .where("userId", "==", userId)
      .get();

    if (resetSnapshots.empty) return; // No records to delete

    const batch = db.batch(); // Batch for efficient operations
    resetSnapshots.forEach((doc) => batch.delete(doc.ref)); // Add delete operations to batch
    await batch.commit(); // Commit all deletes
  } catch (error) {
    console.error("Error deleting password resets:", error);
    throw error;
  }
}

// Function to find password reset records by userId
async function findPasswordResetsByUserId(userId) {
  try {
    const resetSnapshots = await db
      .collection("passwordResets")
      .where("userId", "==", userId)
      .get();

    if (resetSnapshots.empty) return []; // Return empty array if no records

    const records = [];
    resetSnapshots.forEach((doc) => records.push({ id: doc.id, ...doc.data() })); // Collect records
    return records;
  } catch (error) {
    console.error("Error finding password resets:", error);
    throw error;
  }
}

module.exports = {
  createPasswordReset,
  deletePasswordResetsByUserId,
  findPasswordResetsByUserId,
};
