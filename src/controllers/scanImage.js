const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;
const Firestore = require("@google-cloud/firestore");
const serviceAccount = require("./../../serviceaccountkey.json");

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.scanImageToFolder = async (req, res, next) => {
  try {
    const { file } = req.body;
    const userId = req.users.userDocId;

    // Kirim ke Flask API
    const flaskResponse = await axios.post(
      `${process.env.FLASK_API_URL}/process-image`,
      { file },
    );
    const { folderName, pdfData } = flaskResponse.data;

    // Decode PDF dari base64
    const buffer = Buffer.from(pdfData, "base64");

    // Path penyimpanan di GCS
    const fileNamed = `${userId}/folders/${folderName}/${Date.now()}.pdf`;
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(fileNamed);

    // Upload ke GCS
    const stream = blob.createWriteStream({
      metadata: { contentType: "application/pdf" },
    });
    stream.end(buffer);

    stream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

      // Simpan metadata di Firestore
      const folderRef = db.collection(
        `users/${userId}/folders/${folderName}/documents`,
      );
      const doc = await folderRef.add({
        fileName: path.basename(fileNamed),
        fileType: "application/pdf",
        url: publicUrl,
        createdAt: new Date(),
      });

      res
        .status(201)
        .json({ success: true, documentId: doc.id, url: publicUrl });
    });

    stream.on("error", (err) => next(err));
  } catch (err) {
    next(err);
  }
};
