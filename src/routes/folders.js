const express = require('express');
const router = express.Router({ mergeParams: true });

const folders = require('../controllers/folders');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');

router.route('/create').post(authenticate, catchAsync(folders.createFolder))
router.route('/').post(authenticate, catchAsync(folders.getFolders));

router.route('/:folderId/upload').post(authenticate, catchAsync(folders.uploadDocuments))
router.route('/:folderId/update').put(authenticate, catchAsync(folders.updateFolder))
router.route('/:folderId/delete').delete(authenticate, catchAsync(folders.deleteFolder));



module.exports = router;