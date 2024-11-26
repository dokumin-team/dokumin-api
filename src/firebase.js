require("dotenv").config();
const path = require("path");
const serviceAccountPath = path.resolve(process.env.CLOUD_FIRESTORE_CREDENTIAL);
const serviceAccount = require(serviceAccountPath);
const admin = require("firebase-admin");

console.log(serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = db;
