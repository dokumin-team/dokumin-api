const express = require("express");
const router = express.Router({ mergeParams: true });

const documents = require("../controllers/documents");
const catchAsync = require("../utils/catchAsync");
const { authenticate } = require("../middleware/auth");

router.get(
  "/countDocument",
  authenticate,
  catchAsync(documents.getCountDocumentsInAllFolders),
);
router.get("/countFolder", authenticate, catchAsync(documents.getCountFolder));
router.get(
  "/newest",
  authenticate,
  catchAsync(documents.getNewestListDocument),
);
router
  .route("/search")
  .get(authenticate, catchAsync(documents.getSearchDocument));
router.route("/list").get(authenticate, catchAsync(documents.getDocuments));
router
  .route("/listDocumentFolder/:folderId")
  .get(authenticate, catchAsync(documents.getDocumentFolderList));
router
  .route("/folders/:folderId/documents/:documentId/update")
  .put(authenticate, catchAsync(documents.updateDocument));
router
  .route("/folders/:folderId/documents/:documentId/delete")
  .delete(authenticate, catchAsync(documents.deleteDocument));

module.exports = router;
