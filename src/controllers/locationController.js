const Joi = require('joi');

const User = require('../models/User');
const Location = require('../models/Location');

const LocationValidator = require('../validators/LocationValidator');

function getAll(search) {
    return Promise.resolve().then(() => {
        const query = {};
        if (search.title) {
            query['$text'] = {
                $search: search.title
            };
        }
        if (search.user) {
            const user = User.findOne({ username: search.user }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'The user you tried to search on does not exists.',
                    status: 404
                };
            }
            query.owner = user._id;
        }

        return Location.find(query, '-__v -participants').populate('owner', 'username -_id');
    });
}

function create(location, authorization) {
    return Promise.resolve().then(() => {
        if (!location) {
            throw {
                message: 'No location to create.',
                id: 'NO_LOCATION'
            };
        }

        return Joi.validate(location, LocationValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given location is invalid.',
                id: 'INVALID_LOCATION',
                details
            };
        });
    }).then(validated => {
        const newLocation = new Location(validated);

        // Find owner.
        return User
            .findOne({
                username: authorization.username
            }).then(user => {
                if (!user) {
                    throw {
                        id: 'USER_NOT_FOUND',
                        message: 'Bearer of the token is not allowed to create locations.',
                        status: 403
                    };
                }

                newLocation.owner = user._id;

                return newLocation.save();
            }).then(location => {
                return Location.findById(location._id, '-__v').populate('owner', '-_id username');
            });
    });
}

function getOne(id) {
    return Location.findById(id, '-__v').populate('owner', 'username -_id').then(location => {
        if (!location) {
            throw {
                id: 'LOCATION_NOT_FOUND',
                message: 'Location was not found.',
                status: 404
            };
        }

        return location;
    }).catch(() => {
        throw {
            id: 'LOCATION_NOT_FOUND',
            message: 'Location was not found.',
            status: 404
        };
    });
}

function deleteOne(id, authorization) {
    return Promise.resolve().then(async () => {
        const query = { '_id': id };

        if (!authorization.admin) {
            const user = await User.findOne({ username: authorization.username }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'Bearer of the token is not allowed to delete locations.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        return Location.deleteOne(query).then(({ n }) => {
            if (n === 0) {
                throw {
                    id: 'LOCATION_NOT_FOUND',
                    message: 'Location was not found, or the user is not the owner of this location.',
                    status: 404
                };
            }
    
            return true;
        });  
    }).catch(err => {
        if (!err.id) {
            throw {
                id: 'LOCATION_NOT_FOUND',
                message: 'Location was not found.',
                status: 404
            };
        }

        throw err;
    });
}

function updateOne(id, location, authorization) {
    return Promise.resolve().then(() => {
        if (!location) {
            throw {
                message: 'No location to create.',
                id: 'NO_LOCATION'
            };
        }

        return Joi.validate(location, LocationValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given location is invalid.',
                id: 'INVALID_LOCATION',
                details
            };
        });
    }).then(async validated => {
        const query = { '_id': id };

        if (!authorization.admin) {
            const user = await User.findOne({ username: authorization.username }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'Bearer of the token is not allowed to delete locations.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        const location = await Location.findOne(query);
        if (!location) {
            throw {
                id: 'LOCATION_NOT_FOUND',
                message: 'Location was not found, or the user is not the owner of this location.',
                status: 404
            };
        }

        location.title = validated.title;
        location.description = validated.description;
        location.site = validated.site;
        location.last_update = new Date();
        location.contact = validated.contact;
        location.coordinates = validated.coordinates;
        location.types = validated.types;
        location.icon = validated.icon;
        location.opening_hours = validated.opening_hours;
        location.markModified('opening_hours');

        return location.save();
    }).then(location => {
        return Location.findById(location._id, '-__v').populate('owner', 'username -_id');
    });
}

function deleteAll() {
    return Location.deleteMany({}).then(() => {
        return true;
    });
}

module.exports = {
    getAll,
    create,
    getOne,
    deleteOne,
    deleteAll,
    updateOne,
};