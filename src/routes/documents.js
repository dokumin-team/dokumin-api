const express = require('express');
const router = express.Router({ mergeParams: true });

const documents = require('../controllers/documents');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');

router.route('/create').post(authenticate, catchAsync(documents.createDocument));

router
    .route('/:id')
    .put(authenticate, catchAsync(documents.updateDocument))
    .delete(authenticate, catchAsync(documents.deleteDocument))
    .get(authenticate, catchAsync(documents.getDocument))

router.route('/documents').get(authenticate, catchAsync(documents.getDocuments));
router.route('/search').get(authenticate, catchAsync(documents.getSearchDocument));

module.exports = router;
