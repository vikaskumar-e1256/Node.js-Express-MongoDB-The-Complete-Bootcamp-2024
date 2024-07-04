const express = require('express');
const userController = require('./../controllers/userController');
const { authVerification } = require('../controllers/authController');


const router = express.Router();

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .delete(userController.deleteUser);

router.patch('/updateMe', authVerification, userController.updateMe)
router.patch('/deleteMe', authVerification, userController.deleteMe)

module.exports = router;
