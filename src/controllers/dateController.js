const Event = require('../models/Event');

function getDayInfo(today = new Date()) {
    return Promise.resolve().then(() => {
        const day = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 86400000);

        const bisex = today.getFullYear() % 4 === 0;
        const offset = bisex ? 1 : 0;

        const date = {
            irl: today,
            day_of_year: day,
            year: today.getFullYear() - 687,
        };
        if (day < 90 + offset) {
            date.day = day;
            date.season = {
                code: 0,
                name: 'Zéphyr'
            };
        } else if (day < 180 + offset) {
            date.day = day - (90 + offset);
            date.season = {
                code: 1,
                name: 'Phénix'
            };
        } else if (day < 270 + offset) {
            date.day = day - (180 + offset);
            date.season = {
                code: 2,
                name: 'Scion'
            };
        } else {
            date.day = day - (270 + offset);
            date.season = {
                code: 3,
                name: 'Colosse'
            };
        }

        return date;
    });
}

/**
 * Convert an ingame day to an IRL date.
 * @param {Object} date
 * @param {Number} date.day Day to convert.
 * @param {Number} date.season Season to convert.
 * @param {Number} date.year Year to convert.
 */
function ig2irl(date) {
    return Promise.resolve().then(() => {
        const year = date.year + 687;
        const bisex = year % 4 === 0;
        const offset = bisex ? -1 : 0;

        let dayOfYear = 0;
        switch (date.season) {
            case 1:
                dayOfYear = date.day;
                break;
            case 2:
                dayOfYear = 90 + date.day;
                break;
            case 3:
                dayOfYear = 180 + offset + date.day;
                break;
            case 4:
                dayOfYear = 270 + offset + date.day;
                break;
            default:
                throw {
                    message: 'Season must be between 1 and 4.',
                    id: 'INVALID_SEASON',
                    status: 400
                };
        }

        const converted = new Date(year, 0, dayOfYear);

        return converted;
    });
}

/**
 * Convert the IRL day to IG date.
 * @param {Date} day 
 */
function irl2ig(day = new Date()) {
    return getDayInfo(day).then(dayInfos => {
        return {
            date: dayInfos,
        };
    });
}

/**
 * Convert the IRL day to IG date.
 * @param {Date} day 
 */
function getDay(day = new Date()) {
    return getDayInfo(day).then(async dayInfos => {
        const start = new Date(day);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        const end = new Date(day);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);

        const events = await Event.find({ 'dates.start': { '$gt': start, '$lt': end } }, '-__v').populate('owner', '-_id username gw2_account').populate('participants.user', 'username -_id gw2_account');;

        return {
            date: dayInfos,
            events,
            locations: []
        };
    });
}

/**
 * Get info about the current day (IG date) and today's activities.
 */
function getToday() {
    return getDay(new Date());
}

module.exports = {
    getDayInfo,
    getDay,
    getToday,
    ig2irl,
    irl2ig,
};