const express = require('express');
const router = express.Router({ mergeParams: true });

const verifyEmail = require('../controllers/emailVerification');
const catchAsync = require('../utils/catchAsync');

// const { authenticate } = require('../middleware/auth');

router.route('/send').post(catchAsync(verifyEmail.sendOTPVerificationEmail));
router.route('/resend').post(catchAsync(verifyEmail.resendOTPVerificationEmail));
router.route('/verify').post(catchAsync(verifyEmail.verifyOTPEmail));

module.exports = router;
