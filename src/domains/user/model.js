const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// Reference to the users collection
const UserCollection = db.collection("users");

module.exports = UserCollection;
