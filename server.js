const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const mongoose = require('mongoose');


let db;
if (process.env.NODE_ENV === 'production') {
    db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
} else {
    db = process.env.DATABASE_LOCAL;
}

mongoose.connect(db, {
    serverSelectionTimeoutMS: 5000
}).then(() => console.log(`DB connection successfully connected with ${process.env.NODE_ENV} server!`));

const port = process.env.PORT || 3000;
app.listen(port, () =>
{
    console.log(`App running on port ${port}...`);
});
