const { body, validationResult } = require('express-validator');

const validateSignup = [
    body('name')
        .notEmpty().withMessage('Name field is required')
        .bail()
        .isLength({min: 2}).withMessage('Name must be at least 2 character long'),
    body('email')
        .notEmpty().withMessage('Email field is required')
        .bail()
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password field is required')
        .bail()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password field is required')
        .bail()
        .custom(async (confirmPassword, { req }) =>
    {
        if (confirmPassword !== req.body.password)
        {
            throw new Error('Confirm password does not match!');
        }
    }),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateResetPassword = [
    body('password')
        .notEmpty().withMessage('Password field is required')
        .bail()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password field is required')
        .bail()
        .custom(async (confirmPassword, { req }) =>
    {
        if (confirmPassword !== req.body.password)
        {
            throw new Error('Confirm password does not match!');
        }
    }),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateUpdatePassword = [
    body('passwordCurrent')
        .notEmpty().withMessage('Current Password field is required'),

    body('newPassword')
        .notEmpty().withMessage('New Password field is required')
        .bail()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

    body('confirmPassword')
        .notEmpty().withMessage('Confirm password field is required')
        .bail()
        .custom(async (confirmPassword, { req }) =>
    {
            if (confirmPassword !== req.body.newPassword)
        {
            throw new Error('Confirm password does not match!');
        }
    }),
    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

const validateSignIn = [

    body('email')
        .notEmpty().withMessage('Email field is required')
        .bail()
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password field is required'),

    (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateSignIn,
    validateSignup,
    validateResetPassword,
    validateUpdatePassword
}
