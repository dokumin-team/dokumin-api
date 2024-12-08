const Firestore = require("@google-cloud/firestore");
const serviceAccount = require("./../../serviceaccountkey.json");

const db = new Firestore({
  projectId: serviceAccount.project_id,
  keyFilename: "./serviceaccountkey.json",
});

module.exports.getCountDocumentsInAllFolders = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;

    const foldersSnapshot = await db
      .collection(`users/${userId}/folders`)
      .get();

    let totalCount = 0;

    const folderPromises = foldersSnapshot.docs.map(async (folderDoc) => {
      const folderId = folderDoc.id;
      const documentsSnapshot = await db
        .collection(`users/${userId}/folders/${folderId}/documents`)
        .get();
      return documentsSnapshot.size;
    });

    const documentCounts = await Promise.all(folderPromises);
    totalCount = documentCounts.reduce((sum, count) => sum + count, 0);

    res.status(200).json({ status: "SUCCESS", totalCount });
  } catch (error) {
    next(error);
  }
};

module.exports.getCountFolder = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const snapshot = await db.collection(`users/${userId}/folders`).get();
    res.status(200).json({ status: "SUCCESS", totalCount: snapshot.size });
  } catch (error) {
    next(error);
  }
};

module.exports.getNewestListDocument = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const foldersSnapshot = await db
      .collection(`users/${userId}/folders`)
      .get();

    const folderPromises = foldersSnapshot.docs.map(async (folderDoc) => {
      const folderId = folderDoc.id;
      return await db
        .collection(`users/${userId}/folders/${folderId}/documents`)
        .orderBy("createdAt", "desc")
        .limit(3)
        .get();
    });

    const documentSnapshots = await Promise.all(folderPromises);

    // Mengumpulkan dokumen terbaru dari setiap folder
    const documents = documentSnapshots.flatMap((snapshot) =>
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );

    // Mengambil 10 dokumen
    const newestDocuments = documents
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    res.status(200).json({ status: "SUCCESS", documents: newestDocuments });
  } catch (error) {
    next(error);
  }
};

module.exports.getSearchDocument = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Query parameter is required" });
    }

    const foldersSnapshot = await db
      .collection(`users/${userId}/folders`)
      .get();

    const folderPromises = foldersSnapshot.docs.map(async (folderDoc) => {
      const folderId = folderDoc.id;
      const snapshot = await db
        .collection(`users/${userId}/folders/${folderId}/documents`)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });

    const resultsArray = await Promise.all(folderPromises);
    const results = resultsArray
      .flat()
      .filter((doc) =>
        doc.fileName.toLowerCase().includes(query.toLowerCase()),
      );

    res.status(200).json({ status: "SUCCESS", results });
  } catch (error) {
    next(error);
  }
};

module.exports.getDocuments = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const foldersSnapshot = await db
      .collection(`users/${userId}/folders`)
      .get();

    const folderPromises = foldersSnapshot.docs.map(async (folderDoc) => {
      const folderId = folderDoc.id;
      const snapshot = await db
        .collection(`users/${userId}/folders/${folderId}/documents`)
        .get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });

    const documentsArray = await Promise.all(folderPromises);
    const documents = documentsArray.flat();

    res.status(200).json({ status: "SUCCESS", documents });
  } catch (error) {
    next(error);
  }
};

module.exports.getDocumentFolderList = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const { folderId } = req.params;
    const snapshot = await db
      .collection(`users/${userId}/folders/${folderId}/documents`)
      .get();
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json({ status: "SUCCESS", documents });
  } catch (error) {
    next(error);
  }
};

module.exports.updateDocument = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const { folderId, documentId } = req.params;
    const { newFileName } = req.body;

    const docRef = db
      .collection(`users/${userId}/folders/${folderId}/documents`)
      .doc(documentId);

    await docRef.update({ fileName: newFileName });

    res
      .status(200)
      .json({ status: "SUCCESS", message: "Document updated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteDocument = async (req, res, next) => {
  try {
    const userId = req.users.userDocId;
    const { folderId, documentId } = req.params;
    const docRef = db
      .collection(`users/${userId}/folders/${folderId}/documents`)
      .doc(documentId);
    await docRef.delete();
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};
