const Joi = require('joi');

const User = require('../models/User');
const Event = require('../models/Event');

const EventValidator = require('../validators/EventValidator');

function getAll(search) {
    return Promise.resolve().then(() => {
        const query = {};
        if (search.title) {
            query['$text'] = {
                $search: search.title
            };
        }
        if (search.username) {
            const user = User.findOne({ username: search.username }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'The user you tried to search on does not exists.',
                    status: 404
                };
            }
            query.owner = user._id;
        }

        return Event.find(query, '-__v -participants').populate('owner', 'username -_id');
    });
}

module.exports = {
    getAll,
};
