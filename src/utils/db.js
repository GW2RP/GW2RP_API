const mongoose = require('mongoose');

const logger = require('./logger')('database');


module.exports.connect = () => {

    mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/GW2RP', { useNewUrlParser: true });

    const db = mongoose.connection;

    db.on('error', (err) => {
        logger.error(`Could not connect to database: ${err}.`);
    });

    db.on('open', (event) => {
        logger.info('Connected to database.');
    });

    return db;
};