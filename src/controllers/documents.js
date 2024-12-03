const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const serviceAccount = require('./../../serviceaccountkey.json');
// console.log(serviceAccount);

const db = new Firestore({
    projectId: serviceAccount.project_id,
    keyFilename: './serviceaccountkey.json',
});
// console.log(db);

module.exports.updateDocument = async (req, res, next) => { };
module.exports.deleteDocument = async (req, res, next) => { };
module.exports.getDocument = async (req, res, next) => { };
module.exports.getDocuments = async (req, res, next) => { };
module.exports.searchDocument = async (req, res, next) => { };