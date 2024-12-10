const Firestore = require("@google-cloud/firestore");
const serviceAccount = require("./../../serviceaccountkey.json");
const { Storage } = require("@google-cloud/storage");

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

const storage = new Storage({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.createFolder = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { folderName } = req.body;

  try {
    const userDocRef = db.collection("users").doc(userId);
    const folderRef = userDocRef.collection("folders");

    const folderDoc = await folderRef.add({
      folderName: folderName,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, folderId: folderDoc.id });
  } catch (error) {
    next(error);
  }
};

module.exports.getFolders = async (req, res, next) => {
  const userId = req.users.userDocId;

  try {
    const folderRef = db.collection(`users/${userId}/folders`);
    const snapshot = await folderRef.get();

    if (snapshot.empty) {
      return res
        .status(404)
        .json({ success: false, message: "No folders found" });
    }

    const folders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, folders });
  } catch (error) {
    next(error);
  }
};

module.exports.uploadDocument = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { folderId } = req.params;

  const file = req.file;
  const { originalname, mimetype, size, buffer } = file;

  console.log(file);

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  try {
    const bucketName = process.env.BUCKET_NAME;
    const bucket = storage.bucket(bucketName);

    // Construct file name for storage
    const fileNamed = `${userId}/folders/${folderId}/${Date.now()}_${originalname}`;
    const blob = bucket.file(fileNamed);

    // Create a write stream to upload the file to GCP
    const stream = blob.createWriteStream({
      metadata: { contentType: mimetype },
    });

    stream.on("error", (err) => next(err));

    stream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

      // Save document metadata in Firestore
      const documentRef = db.collection(
        `users/${userId}/folders/${folderId}/documents`,
      );
      const doc = await documentRef.add({
        fileName: originalname,
        fileType: mimetype,
        fileSize: size,
        url: publicUrl,
        createdAt: new Date(),
      });

      res
        .status(201)
        .json({ success: true, documentId: doc.id, url: publicUrl });
    });

    stream.end(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports.updateFolder = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { folderId } = req.params;
  const { newFolderName } = req.body;

  try {
    const folderRef = db.doc(`users/${userId}/folders/${folderId}`);
    await folderRef.update({
      folderName: newFolderName,
      updatedAt: new Date(),
    });

    res
      .status(200)
      .json({ success: true, message: "Folder updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteFolder = async (req, res, next) => {
  const userId = req.users.userDocId;
  const { folderId } = req.params;

  try {
    const folderRef = db.doc(`users/${userId}/folders/${folderId}`);
    await folderRef.delete();

    res
      .status(200)
      .json({ success: true, message: "Folder deleted successfully" });
  } catch (error) {
    next(error);
  }
};
