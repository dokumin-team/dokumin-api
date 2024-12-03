const express = require('express');
const router = express.Router({ mergeParams: true });

const folders = require('../controllers/folders');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');


router.route('/create').post(authenticate, catchAsync(folders.createDocument));

router.route('/:id/folders')
    .post(authenticate, catchAsync(folders.createFolder))
    .put(authenticate, catchAsync(folders.updateFolder))
    .delete(authenticate, catchAsync(folders.deleteFolder));

module.exports = router;