const express = require('express');
const { signup, login, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController');
const { validateSignup, validateSignIn, validateResetPassword, validateUpdatePassword } = require('../middlewares/validateAuth');
const { authVerification } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateSignIn, login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', validateResetPassword, resetPassword);
router.patch('/update-password', authVerification, validateUpdatePassword, updatePassword);

module.exports = router;
