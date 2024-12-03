const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const serviceAccount = require('./../../serviceaccountkey.json');
// console.log(serviceAccount);

const db = new Firestore({
    projectId: serviceAccount.project_id,
    keyFilename: './serviceaccountkey.json',
});
// console.log(db);

module.exports.requestOTPPasswordReset = async (req, res, next) => { };
module.exports.sendOTPPasswordResetEmail = async (req, res, next) => { };
module.exports.resetUserPassword = async (req, res, next) => { };
module.exports.resendOTPPasswordResetEmail = async (req, res, next) => { };

