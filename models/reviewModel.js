const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'review field is required.'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'rating field is required.'],
        min: [1, 'rating must have at least 1 star'],
        max: [5, 'rating can not be exceeded more than 5 star'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'review must belong to a tour']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
