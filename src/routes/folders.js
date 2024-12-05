const express = require('express');
const router = express.Router({ mergeParams: true });

const folders = require('../controllers/folders');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');

router.route('/:id/folder/create').post(authenticate, catchAsync(folders.createDocument));
router.route('/folders').post(authenticate, catchAsync(folders.getFolders));

router.route('/:id/folders')
    .post(authenticate, catchAsync(folders.createFolder))
    .put(authenticate, catchAsync(folders.updateFolder))
    .delete(authenticate, catchAsync(folders.deleteFolder));

module.exports = router;