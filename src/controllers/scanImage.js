const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;
const Firestore = require("@google-cloud/firestore");
const serviceAccount = require("./../../serviceaccountkey.json");
require("dotenv").config();

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.scanImageToFolder = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const file = req.file;
    const { originalname, size } = file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", file.buffer, originalname);

    // Kirim gambar ke Flask API untuk klasifikasi
    const flaskResponse = await axios.post(
      `${process.env.FLASK_API_URL}/process-image`,
      formData,
      { headers: formData.getHeaders() },
    );

    console.log("Response from Flask:", flaskResponse.data);

    const { pdfData, predicted_label } = flaskResponse.data;

    if (!pdfData || !predicted_label) {
      throw new Error("Invalid response from Flask API");
    }

    // Decode PDF dari base64
    const buffer = Buffer.from(pdfData, "base64");

    // Tentukan nama folder berdasarkan hasil klasifikasi
    const folderName = ["KTP", "KK", "SIM"].includes(predicted_label)
      ? "Pribadi"
      : "Lainnya";

    // Periksa apakah folder dengan nama yang sama sudah ada
    const foldersRef = db.collection(`users/${userId}/folders`);
    const querySnapshot = await foldersRef
      .where("folderName", "==", folderName)
      .get();

    let folderId;
    if (querySnapshot.empty) {
      // Folder tidak ada, buat folder baru
      const newFolder = await foldersRef.add({
        folderName: folderName,
        createdAt: new Date(),
      });
      folderId = newFolder.id;
    } else {
      // Ambil ID folder yang ada
      folderId = querySnapshot.docs[0].id;
    }

    // Tentukan path penyimpanan di GCS
    const fileNamed = `${userId}/folders/${folderId}/${originalname}.pdf`;
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(fileNamed);

    // Upload file ke GCS
    await new Promise((resolve, reject) => {
      const stream = blob.createWriteStream({
        metadata: { contentType: "application/pdf" },
      });

      stream.on("finish", resolve);
      stream.on("error", reject);

      stream.end(buffer);
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

    // Simpan metadata di Firestore
    const folderRef = db.collection(
      `users/${userId}/folders/${folderId}/documents`,
    );
    const doc = await folderRef.add({
      fileName: originalname,
      fileType: "application/pdf",
      fileSize: size,
      url: publicUrl,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      documentId: doc.id,
      url: publicUrl,
      classification: predicted_label,
      folderName: folderName,
    });
  } catch (err) {
    console.error("Error processing request:", err);
    next(err);
  }
};
