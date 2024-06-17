const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

let db;
if (process.env.NODE_ENV === 'production')
{
    db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
} else
{
    db = process.env.DATABASE_LOCAL;
}

mongoose.connect(db, {
    serverSelectionTimeoutMS: 5000
}).then(() => console.log(`DB connection successfully connected with ${process.env.NODE_ENV} server!`));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const insertData = async () =>
{
    try {
        await Tour.create(tours);
        console.log('Data successfully inserted');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

const deleteData = async () =>
{
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if (process.argv[2] == '--import') {
    insertData();
} else if (process.argv[2] == '--delete') {
    deleteData();
}

// Command run in terminal

// node dev-data/data/import-data.js --import
// node dev-data/data/import-data.js --delete
