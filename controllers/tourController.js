const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) =>
{
    try
    {
        // BUILD QUERY
        // 1.) Filtering
        const queryObj = Object.assign({}, req.query);
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // 2.) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/, match => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));

        // 3.) Sorting
        if (req.query.sort)
        {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else
        {
            query = query.sort('-createdAt'); // - means in desc order
        }

        // 4.) Field limiting
        if (req.query.fields) {
            const selectFields = req.query.fields.split(',').join(' ');
            query = query.select(selectFields);
        } else
        {
            query = query.select('-__v'); // - means we are excluding __v from the response
        }

        // 5.) Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 10;
        const skip = (page - 1) * limit; // formula
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const countTours = await Tour.countDocuments();
            if (skip >= countTours) {
                throw new Error('This page does not exist.');
            }
        }

        // EXECUTE QUERY
        const tours = await query;
        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }

};

exports.createTour = async (req, res) =>
{
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        });
    }
}

exports.getTour = async (req, res) =>
{
    try {
        const id = req.params.id;

        const tour = await Tour.findById(id);

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

};

exports.updateTour = async (req, res) =>
{
    try {
        const id = req.params.id;
        const tour = await Tour.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

};

exports.deleteTour = async (req, res) =>
{
    try
    {
        const id = req.params.id;
        await Tour.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

};

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
