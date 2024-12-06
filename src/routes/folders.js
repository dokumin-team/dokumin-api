const express = require('express');
const router = express.Router({ mergeParams: true });

const folders = require('../controllers/folders');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');


router.route('/create').post(authenticate, catchAsync(folders.createFolder))
router.route('/getListFolder').get(authenticate, catchAsync(folders.getFolders));

router.post('/:folderId/upload', authenticate, upload.single('file'), catchAsync(folders.uploadDocument));

router.route('/:folderId/update').put(authenticate, catchAsync(folders.updateFolder))
router.route('/:folderId/delete').delete(authenticate, catchAsync(folders.deleteFolder));

module.exports = router;