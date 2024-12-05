const express = require('express');
const router = express.Router({ mergeParams: true });

const verifyEmail = require('../controllers/emailVerification');
const catchAsync = require('../utils/catchAsync');

const { authenticate } = require('../middleware/auth');

router.route('/send').post(authenticate, catchAsync(verifyEmail.sendOTPVerificationEmail));
router.route('/resend').post(authenticate, catchAsync(verifyEmail.resendOTPVerificationEmail));
router.route('/verify').post(authenticate, catchAsync(verifyEmail.verifyOTPEmail));

module.exports = router;
