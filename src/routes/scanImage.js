const express = require("express");
const router = express.Router({ mergeParams: true });

const scanImage = require("../controllers/scanImage");
const catchAsync = require("../utils/catchAsync");
const { authenticate } = require("../middleware/auth");

router
  .route("/scan")
  .post(authenticate, catchAsync(scanImage.scanImageToFolder));

module.exports = router;
