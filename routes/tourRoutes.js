const express = require('express');
const tourController = require('./../controllers/tourController');
const { authVerification, restrictTo } = require('../controllers/authController');
const router = express.Router();

// router.param('id', tourController.checkID);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

router
    .route('/')
    .get(authVerification, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authVerification, restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;
