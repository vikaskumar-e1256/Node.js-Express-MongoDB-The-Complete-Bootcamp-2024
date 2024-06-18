const mongoose = require('mongoose');
const slugify = require('slugify');


const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        min: [5, 'A tour name must have at least 5 characters'],
        max: [255, 'A tour name can not be exceeded more than 255 characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Only allowed easy medium and difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val)
            {
                return val < this.price;
            }, 
            message: 'Discount price should be less than regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    secretTour: {
        type: Boolean,
        default: false
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date]
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
});
tourSchema.virtual('durationInWeeks').get(function ()
{
    return this.duration / 7;
});

// Document Middleware: runs befor save() and create();
tourSchema.pre('save', function (next)
{
    this.slug = slugify(this.name, { lower: true });
    next();
});

// tourSchema.pre('save', function (next)
// {
//     console.log('will save the document...');;
//     next();
// });

// tourSchema.post('save', function (doc, next)
// {
//     console.log(doc);
//     next();
// });

// Query Middleware
tourSchema.pre(/^find/, function (next)
{
    this.find({ secretTour: { $ne: true } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
