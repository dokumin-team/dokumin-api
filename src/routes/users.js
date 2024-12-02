const express = require('express');
const router = express.Router({ mergeParams: true });

const users = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const { authenticate } = require('../middleware/auth');

router.route('/signup').post(catchAsync(users.signup));
router.route('/signin').post(catchAsync(users.signin));
router.route('/logout').post(authenticate, users.logout);
router.route('/profile').get(catchAsync(users.getProfile));

module.exports = router;
