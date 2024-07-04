const User = require('../models/userModel');
const { sendResponse } = require('../utils/responseHandler');


exports.getAllUsers = (req, res) =>
{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.getUser = (req, res) =>
{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
exports.createUser = (req, res) =>
{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

exports.updateMe = async (req, res, next) =>
{
    const user = await User.findById(req.user._id);

    const { name } = req.body;
    user.name = name;
    await user.save();

    return sendResponse(res, 200, true, 'User details successfully updated', {user});
};

exports.deleteMe = async (req, res, next) =>
{
    const user = await User.findById(req.user._id);

    user.isActive = false;
    await user.save();

    return sendResponse(res, 200, true, 'User successfully deleted');
};

exports.deleteUser = (req, res) =>
{
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};
