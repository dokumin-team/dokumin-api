const express = require('express');
const router = express.Router({ mergeParams: true });

const forgotPassword = require('../controllers/forgotPassword');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');

router.route('/request').post(authenticate, catchAsync(forgotPassword.requestOTPPasswordReset));
router.route('/reset').post(authenticate, catchAsync(forgotPassword.resetUserPassword));
router.route('/resend').post(authenticate, catchAsync(forgotPassword.resendOTPPasswordReset));

module.exports = router;
