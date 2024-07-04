const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password.'],
        minlength: 8
    },
    photo: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    role: {
        type: String,
        enum: ['user', 'admin', 'lead', 'lead-guide'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

userSchema.methods.changePasswordAfter = function (JWT_Timestamp)
{
    if (this.passwordChangedAt)
    {
        const timestamp = parseInt (this.passwordChangedAt.getTime()/1000, 10);

        return JWT_Timestamp < timestamp;
        // console.log(timestamp, JWT_Timestamp);
    }
    // false means not changed
    return false;
}

userSchema.methods.createResetPasswordToken = function ()
{
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Saving encrypted token into the db;
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

    console.log({ resetToken }, this.passwordResetToken);
    // returning plain token;
    return resetToken;
}

userSchema.methods.passwordCompare = async function(incomingPassword, userPassword)
{
    return await bcrypt.compare(incomingPassword, userPassword);
}

const User = mongoose.model('User', userSchema);

module.exports = User;
