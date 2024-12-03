const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const serviceAccount = require('./../../serviceaccountkey.json');
// console.log(serviceAccount);

const db = new Firestore({
    projectId: serviceAccount.project_id,
    keyFilename: './serviceaccountkey.json',
});
// console.log(db);

module.exports.createDocument = async (req, res, next) => { };
module.exports.createFolder = async (req, res, next) => { };
module.exports.updateFolder = async (req, res, next) => { };
module.exports.deleteFolder = async (req, res, next) => { };