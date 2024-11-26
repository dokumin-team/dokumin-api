require("dotenv").config();
// const { initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require('path');
const serviceAccountPath = path.resolve(process.env.CLOUD_FIRESTORE_CREDENTIAL);

// Load the service account key
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase app
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`,
});

// Initialize Firestore
const db = getFirestore(app);

console.log("Connected to Firestore!");

module.exports = db;
