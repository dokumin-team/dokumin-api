const express = require("express");
const router = express.Router({ mergeParams: true });
const { upload, handleMulterError } = require("../middleware/multer");

const scanImage = require("../controllers/scanImage");
const catchAsync = require("../utils/catchAsync");
const { authenticate } = require("../middleware/auth");

router.post(
  "/scan",
  authenticate,
  upload.single("file"),
  handleMulterError,
  catchAsync(scanImage.scanImageToFolder),
);

module.exports = router;
