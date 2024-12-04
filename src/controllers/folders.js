// const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const serviceAccount = require('./../../serviceaccountkey.json');

const db = new Firestore({
    projectId: serviceAccount.project_id,
    keyFilename: './serviceaccountkey.json',
});

// Membuat Folder
module.exports.createFolder = async (req, res, next) => {
    const { id } = req.params; // ID user
    const { folderName } = req.body;

    try {
        const folderRef = db.collection(`users/${id}/folders`);
        const folderDoc = await folderRef.add({ name: folderName, createdAt: new Date() });
        res.status(201).json({ success: true, folderId: folderDoc.id });
    } catch (error) {
        next(error);
    }
};

// Mendapatkan Semua Folder
module.exports.getFolders = async (req, res, next) => {
    const { id } = req.params; // ID user

    try {
        const folderRef = db.collection(`users/${id}/folders`);
        const snapshot = await folderRef.get();
        const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json({ success: true, folders });
    } catch (error) {
        next(error);
    }
};

// Membuat Document di dalam Folder
module.exports.createDocument = async (req, res, next) => {
    const { id, folder } = req.params; // ID user dan ID folder
    const { title, content } = req.body;

    try {
        const documentRef = db.collection(`users/${id}/folders/${folder}/documents`);
        const doc = await documentRef.add({ title, content, createdAt: new Date() });
        res.status(201).json({ success: true, documentId: doc.id });
    } catch (error) {
        next(error);
    }
};

// Mengupdate Folder
module.exports.updateFolder = async (req, res, next) => {
    const { id, folder } = req.params; // ID user dan ID folder
    const { folderName } = req.body;

    try {
        const folderRef = db.doc(`users/${id}/folders/${folder}`);
        await folderRef.update({ name: folderName, updatedAt: new Date() });
        res.status(200).json({ success: true, message: 'Folder updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Menghapus Folder
module.exports.deleteFolder = async (req, res, next) => {
    const { id, folder } = req.params; // ID user dan ID folder

    try {
        const folderRef = db.doc(`users/${id}/folders/${folder}`);
        await folderRef.delete();
        res.status(200).json({ success: true, message: 'Folder deleted successfully' });
    } catch (error) {
        next(error);
    }
};
