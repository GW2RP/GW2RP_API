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
        if (search.user) {
            const user = User.findOne({
                username: search.user
            }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'The user you tried to search on does not exists.',
                    status: 404
                };
            }
            query.owner = user._id;
        }

        return Event.find(query, '-__v').populate('owner', 'username -_id').populate('participants.user', 'username -_id');
    });
}

function create(event, authorization) {
    return Promise.resolve().then(() => {
        if (!event) {
            throw {
                message: 'No event to create.',
                id: 'NO_EVENT'
            };
        }

        return Joi.validate(event, EventValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given event is invalid.',
                id: 'INVALID_EVENT',
                details
            };
        });
    }).then(validated => {
        const newEvent = new Event(validated);

        // Find owner.
        return User
            .findOne({
                username: authorization.username
            }).then(user => {
                if (!user) {
                    throw {
                        id: 'USER_NOT_FOUND',
                        message: 'Bearer of the token is not allowed to create events.',
                        status: 403
                    };
                }

                newEvent.owner = user._id;

                return newEvent.save();
            }).then(event => {
                return Event.findById(event._id, '-__v').populate('owner', '-_id username');
            });
    });
}

function getOne(id) {
    return Event.findById(id, '-__v').populate('owner', 'username -_id').populate('participants.user', 'username -_id').then(event => {
        if (!event) {
            throw {
                id: 'EVENT_NOT_FOUND',
                message: 'Event was not found.',
                status: 404
            };
        }

        return event;
    }).catch(() => {
        throw {
            id: 'EVENT_NOT_FOUND',
            message: 'Event was not found.',
            status: 404
        };
    });
}

function deleteOne(id, authorization) {
    return Promise.resolve().then(async () => {
        const query = {
            '_id': id
        };

        if (!authorization.admin) {
            const user = await User.findOne({
                username: authorization.username
            }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'Bearer of the token is not allowed to delete events.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        return Event.deleteOne(query).then(({
            n
        }) => {
            if (n === 0) {
                throw {
                    id: 'EVENT_NOT_FOUND',
                    message: 'Event was not found, or the user is not the owner of this event.',
                    status: 404
                };
            }

            return true;
        });
    }).catch(err => {
        if (!err.id) {
            throw {
                id: 'EVENT_NOT_FOUND',
                message: 'Event was not found.',
                status: 404
            };
        }

        throw err;
    });
}

function updateOne(id, event, authorization) {
    return Promise.resolve().then(() => {
        if (!event) {
            throw {
                message: 'No event to create.',
                id: 'NO_EVENT'
            };
        }

        return Joi.validate(event, EventValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given event is invalid.',
                id: 'INVALID_EVENT',
                details
            };
        });
    }).then(async validated => {
        const query = {
            '_id': id
        };

        if (!authorization.admin) {
            const user = await User.findOne({
                username: authorization.username
            }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'Bearer of the token is not allowed to delete events.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        const event = await Event.findOne(query);
        if (!event) {
            throw {
                id: 'EVENT_NOT_FOUND',
                message: 'Event was not found, or the user is not the owner of this event.',
                status: 404
            };
        }

        event.title = validated.title;
        event.description = validated.description;
        event.site = validated.site;
        event.last_update = new Date();
        event.types = validated.types;
        event.icon = validated.icon;
        event.dates = validated.dates;
        event.contact = validated.contact;
        event.coordinates = validated.coordinates;

        return event.save();
    }).then(event => {
        return Event.findById(event._id, '-__v').populate('owner', 'username -_id');
    });
}

function deleteAll() {
    return Event.deleteMany({}).then(() => {
        return true;
    });
}

function participate(id, participation, authorization) {
    return Promise.resolve().then(() => {
        if (!participation || typeof participation !== 'string' || !['YES', 'MAYBE', 'NO'].includes(participation.toUpperCase())) {
            throw {
                id: 'INVALID_PARTICIPATION',
                message: 'participation must be YES, MAYBE or NO.',
                status: 400,
            };
        }

        return User.findOne({
            username: authorization.username
        });
    }).then(user => {
        if (!user) {
            throw {
                id: 'USER_NOT_FOUND',
                message: 'The user does not exist.',
                status: 404,
            };
        }

        return Promise.all([user, Event.findById(id)]);
    }).then(([user, event]) => {
        if (!event) {
            throw {
                id: 'EVENT_NOT_FOUND',
                message: 'The event does not exist.',
                status: 404,
            };
        }

        const existingIndex = event.participants.findIndex(p => p.user.toString() == user._id.toString());
        if (existingIndex > -1) {
            event.participants[existingIndex].participation = participation;
        } else {
            event.participants.push({
                user: user._id,
                participation,
            });
        }

        return event.save().then(() => {
            return participation;
        });
    });
}

function purge() {
    return Event.find({ 'dates.end': { '$lt': new Date() } }).then(async (events) => {

        let eventsToRemove = events.filter(event => event.dates.recursivity === 'NONE').map(event => event._id);
        await Event.remove({ '_id': { '$in': eventsToRemove } });
        
        let eventsToUpdate = events.filter(event => event.dates.recursivity !== 'NONE');
        await Promise.all(eventsToUpdate.map(event => {
            let start = new Date(event.dates.start);
            let end = new Date(event.dates.end);
            
            switch (event.dates.recursivity) {
                case '1-WEEK':
                    start.setDate(start.getDate() + 7);
                    end.setDate(end.getDate() + 7);
                    break;
                case '2-WEEK':
                    start.setDate(start.getDate() + 14);
                    end.setDate(end.getDate() + 14);
                    break;
                case '3-WEEK':
                    start.setDate(start.getDate() + 21);
                    end.setDate(end.getDate() + 21);
                    break;
                case '4-WEEK':
                    start.setDate(start.getDate() + 28);
                    end.setDate(end.getDate() + 28);
                    break;
            }

            event.dates.start = start;
            event.dates.end = end;

            return event.save();
        }));

        return;
    });
}

module.exports = {
    getAll,
    create,
    getOne,
    deleteOne,
    deleteAll,
    updateOne,
    participate,
    purge,
};