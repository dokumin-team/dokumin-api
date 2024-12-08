require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 8080;

const ExpressError = require('./utils/expressError');

const userRoutes = require('./routes/users');
const emailVerificationRoutes = require('./routes/emailVerification');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const folderRoutes = require('./routes/folders');
const documentRoutes = require('./routes/documents');
const scanRoutes = require('./routes/scanImage');
const cookieParser = require('cookie-parser');

const app = express();

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(userRoutes);

app.use('/users', userRoutes);
app.use('/folders', folderRoutes);
app.use('/documents', documentRoutes);
app.use('/model', scanRoutes);
app.use('/userOTPVerifications', emailVerificationRoutes);
app.use('/forgotPasswordOTPs', forgotPasswordRoutes);

app.get('/', (req, res) => {
    res.json({ msg: 'Home' });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res) => {
    const { status = 500, message = 'Something went wrong', stack } = err;
    if (!err.message) {
        err.message = 'Something went wrong';
    }
    res.status(status).json({ error: true, message, stack });
});

//                      FIRESTORE INITIALIZATION
const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");

const serviceAccountPath = path.resolve(process.env.CLOUD_FIRESTORE_CREDENTIAL);
const serviceAccount = require(serviceAccountPath);
// console.log(serviceAccount);

initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`,
});

// =================================================================

app.listen(PORT, () => {
    console.log(`Server run on ${PORT}`);
});

module.exports = { app, serviceAccount };