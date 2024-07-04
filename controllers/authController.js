const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { sendResponse } = require('../utils/responseHandler');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// It's a higher order function which is receiving roles and convert into an array
// Only those roles can perform action which is we receiving
const restrictTo = (...roles) =>
{
    return (req, res, next) =>
    {
        // Here req.user we have passed in authVerification middleware
        // So that we can check current loggedIn user role
        if (!roles.includes(req.user.role)) {
            return sendResponse(res, 403, false, 'Unauthorized access!');
        }
        next();
    }
}

const authVerification = async (req, res, next) =>
{
    let token;
    // 1. Get the token if it's there
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];
        if (!token) return sendResponse(res, 401, false, 'You are not loggedIn, Please login to get access !');
    } else
    {
        return sendResponse(res, 401, false, 'Please provide a token, Please login to get access !');
    }
    // 2. Verify the token
    try
    {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        var id = decoded.id;
        var createTokenTime = decoded.iat;
    } catch (err)
    {
        sendResponse(res, 400, false, 'Invalid token, Please login again!');
    }
    // 3. Check if user still exist
    const isUser = await User.findById(id);
    if (!isUser) return sendResponse(res, 400, false, 'User does not exist!');

    // 4. Check if user changed the password after the token was issued.
    if (isUser.changePasswordAfter(createTokenTime))
    {
        return sendResponse(res, 401, false, 'User recently change the password, Please login again!');
    };

    // Grant to access
    req.user = isUser;
    next();
}

const generateToken = (id) =>
{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN
    });
}

const createAndSendToken = (res, statusCode, status, message, user) =>
{
    const token = generateToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
    res.cookie('jwt', token, cookieOption);
    user.password = undefined;
    sendResponse(res, statusCode, status, message, { token, user });
}

const signup = async (req, res, next) =>
{
    try
    {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) return sendResponse(res, 400, false, 'Email already in use');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });

        await user.save();

        createAndSendToken(res, 201, true, 'User registered successfully', user);
        // let token = generateToken(user._id);

        // sendResponse(res, 201, true, 'User registered successfully', { token, user });
    } catch (err)
    {
        next(err);
    }
};

const login = async (req, res, next) =>
{
    try
    {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email: email, isActive: true });

        if (!existingUser) return sendResponse(res, 400, false, 'Email does not exist in our database!');

        const match = await bcrypt.compare(password, existingUser.password);

        if (!match) return sendResponse(res, 400, false, 'Password does not matched!');

        createAndSendToken(res, 200, true, 'User loggedIn successfully', existingUser);
        // let token = generateToken(existingUser._id);

        // sendResponse(res, 201, true, 'User loggedIn successfully', {token});
    } catch (err)
    {
        next(err);
    }
};

const forgotPassword = async (req, res, next) =>
{
    // 1. Find the user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) return sendResponse(res, 404, false, 'User does not exist!');

    // 2. Generate the token
    const resetPasswordToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send token in user email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetPasswordToken}`
    const message = `Forgot your password? Submit a patch request with your new password and confirm password
     to: ${resetUrl}\n If you did not forgot password, Please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
        sendResponse(res, 200, true, 'Token send to the mail');

    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetTokenExpire = undefined
        await user.save({ validateBeforeSave: false });
        return sendResponse(res, 500, false, 'There was an error sending the email. Try again later!');
    }

}

const resetPassword = async (req, res, next) =>
{
    // 1. Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetTokenExpire: {$gt:  Date.now()} });

    // 2. If token has not expired, and there is user, set new password
    if (!user) return sendResponse(res, 400, false, 'Token is invalid or has expired!');

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save();

    // 3. Log the user in, Send JWT
    let token = generateToken(user._id);

    sendResponse(res, 201, true, 'Password successfully updated', { token, user });
}

const updatePassword = async (req, res, next) =>
{
    // 1. Get user from collection
    const user = await User.findById(req.user._id).select('+password');
    // console.log(user);
    // 2.  check if posted current password is correct
    if (!(await user.passwordCompare(req.body.passwordCurrent, user.password)))
    {
        return sendResponse(res, 401, false, 'Current Password does not matched!');
    }
    // 3. If so, update password
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // 4. Log user in, send JWT
    const token = generateToken(user._id);
    sendResponse(res, 200, true, 'User loggedIn successfully', { token });

}

module.exports = {
    signup,
    login,
    authVerification,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword
};
