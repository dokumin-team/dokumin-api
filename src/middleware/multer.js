const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, cb) => {
  const allowedExtensions = {
    image: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
    document: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".txt",
      ".ppt",
      ".pptx",
    ],
    archive: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
  };

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allAllowedExtensions = [
    ...allowedExtensions.image,
    ...allowedExtensions.document,
    ...allowedExtensions.archive,
  ];

  const generateErrorResponse = (message, allowedTypes) => ({
    success: false,
    error: {
      message,
      allowedTypes,
    },
  });

  if (!allAllowedExtensions.includes(fileExtension)) {
    const error = generateErrorResponse(
      "File type not allowed!",
      allAllowedExtensions,
    );
    return cb(error, false);
  }

  if (
    req.body.type === "image" &&
    !allowedExtensions.image.includes(fileExtension)
  ) {
    const error = generateErrorResponse(
      "Image file type not allowed!",
      allowedExtensions.image,
    );
    return cb(error, false);
  } else if (
    req.body.type === "document" &&
    !allowedExtensions.document.includes(fileExtension)
  ) {
    const error = generateErrorResponse(
      "Document file type not allowed!",
      allowedExtensions.document,
    );
    return cb(error, false);
  } else if (
    req.body.type === "archive" &&
    !allowedExtensions.archive.includes(fileExtension)
  ) {
    const error = generateErrorResponse(
      "Archive file type not allowed!",
      allowedExtensions.archive,
    );
    return cb(error, false);
  } else {
    return cb(null, true);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maks 10 MB
});

const handleMulterError = (err, req, res, next) => {
  if (err && err.success === false) {
    return res.status(400).json(err);
  }
  next(err);
};

module.exports = { upload, handleMulterError };
