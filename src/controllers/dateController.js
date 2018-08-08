function getDayInfo(today = new Date()) {
    return Promise.resolve().then(() => {
        const day = Math.ceil((today - new Date(today.getFullYear(), 0, 1)) / 86400000);

        const bisex = today.getFullYear() % 4 === 0;
        const offset = bisex && 1;

        const date = {
            irl: new Date(),
            day_of_year: day,
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

function getDay(day = new Date()) {
    return getDayInfo(day).then(dayInfos => {
        // Get events for today.
        
        // Get locations open today.

        return {
            date: dayInfos,
            events: [],
            locations: []
        };
    });
}

module.exports = {
    getDayInfo,
    getDay,
};