const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) =>
{
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, res, next) =>
{
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });


});

exports.createTour = catchAsync(async (req, res, next) =>
{
    console.log(req.body);
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });

});

exports.getTour = catchAsync(async (req, res, next) =>
{
    const id = req.params.id;

    const tour = await Tour.findById(id);
    if (!tour)
    {
        return next(new AppError('Tour does not exist', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });


});

exports.updateTour = catchAsync(async (req, res, next) =>
{
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });


});

exports.deleteTour = catchAsync(async (req, res, next) =>
{
    const id = req.params.id;
    const tour = await Tour.findById(id);

    if (!tour)
    {
        return next(new AppError('Tour does not exist', 404));
    }

    await tour.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.getTourStats = catchAsync(async (req, res, next) =>
{
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: {
                minPrice: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats }
    });


});

exports.getMonthlyPlan = catchAsync(async (req, res, next) =>
{
    const year = req.params.year * 1; // multiply by 1 for transform into a number
    const plan = await Tour.aggregate([
        // "unwind" Deconstructs an array field from the input documents to output a document for each element
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: { plan }
    });

});

/**
 *
 *
 * Code for file based CRUD operation
 *
 *
 *
const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) =>
{
    console.log(`Tour id is: ${val}`);

    if (req.params.id * 1 > tours.length)
    {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    next();
};

exports.checkBody = (req, res, next) =>
{
    if (!req.body.name || !req.body.price)
    {
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        });
    }
    next();
};

exports.getAllTours = (req, res) =>
{
    console.log(req.requestTime);

    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
};

exports.getTour = (req, res) =>
{
    console.log(req.params);
    const id = req.params.id * 1;

    const tour = tours.find(el => el.id === id);

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
};


exports.updateTour = (req, res) =>
{
    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    });
};

exports.deleteTour = (req, res) =>
{
    res.status(204).json({
        status: 'success',
        data: null
    });
};
*/
