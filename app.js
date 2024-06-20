const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development')
{
    app.use(morgan('dev'));
}

// 1) MIDDLEWARES
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) =>
{
    req.requestTime = new Date().toISOString();
    next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
