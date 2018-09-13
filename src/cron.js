const schedule = require('node-schedule');

const Events = require('./controllers/eventController');

module.exports.init = () => {
    console.log('CRON tasks initialized!');

    schedule.scheduleJob('purge-events', '0 1 * * * *', () => {
        console.log('purge-events.');
        Events.purge().then(() => {
            console.log('events Purged.');
        });
    });
};