const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');



const app = express();

/**
 *
 *
 * Global Middlewares
 *
 *
*/

// Set Security HTTP headers
app.use(helmet());

// HTTP request logger
if (process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

// Limit requests from same IP.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
    message: 'To many requests from this IP, Please try again in 15 minutes'
});
app.use('/api', limiter);

// Body Parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Testing purpose
app.use((req, res, next) =>
{
    req.requestTime = new Date().toISOString();
    next();
});

/**
 *
 *
 * ROUTES
 *
 *
*/
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

// If route does not exist
app.all('*', (req, res, next) =>
{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    // res.status(404).json({
    //     status: 'fail',
    //     message: "Can't find " + req.originalUrl + " on this server"
    // })
})

app.use(globalErrorHandler);

module.exports = app;
