const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// Reference to User Verification collection
const UserVerificationCollection = db.collection("userVerifications");

module.exports = UserVerificationCollection;
