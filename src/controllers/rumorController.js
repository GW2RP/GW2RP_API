const Joi = require('joi');

const User = require('../models/User');
const Rumor = require('../models/Rumor');
const RumorValidator = require('../validators/RumorValidator');

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

        return Rumor.find(query, '-__v').populate('owner', 'username -_id');
    });
}

function create(rumor, authorization) {
    return Promise.resolve().then(() => {
        if (!rumor) {
            throw {
                message: 'No rumor to create.',
                id: 'NO_RUMOR'
            };
        }

        return Joi.validate(rumor, RumorValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given rumor is invalid.',
                id: 'INVALID_RUMOR',
                details
            };
        });
    }).then(validated => {
        const newRumor = new Rumor(validated);

        // Find owner.
        return User
            .findOne({
                username: authorization.username
            }).then(user => {
                if (!user) {
                    throw {
                        id: 'USER_NOT_FOUND',
                        message: 'Bearer of the token is not allowed to create rumors.',
                        status: 403
                    };
                }

                newRumor.owner = user._id;

                return newRumor.save();
            }).then(rumor => {
                return Rumor.findById(rumor._id, '-__v').populate('owner', '-_id username');
            });
    });
}

function getOne(id) {
    return Rumor.findById(id, '-__v').populate('owner', 'username -_id').then(rumor => {
        if (!rumor) {
            throw {
                id: 'RUMOR_NOT_FOUND',
                message: 'Rumor was not found.',
                status: 404
            };
        }

        return rumor;
    }).catch(err => {
        throw {
            id: 'RUMOR_NOT_FOUND',
            message: 'Rumor was not found.',
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
                    message: 'Bearer of the token is not allowed to delete rumors.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        return Rumor.deleteOne(query).then(({ n, ok }) => {
            if (n === 0) {
                throw {
                    id: 'RUMOR_NOT_FOUND',
                    message: 'Rumor was not found, or the user is not the owner of this rumor.',
                    status: 404
                };
            }
    
            return true;
        });  
    }).catch(err => {
        if (!err.id) {
            throw {
                id: 'RUMOR_NOT_FOUND',
                message: 'Rumor was not found.',
                status: 404
            };
        }

        throw err;
    });
}

function updateOne(id, rumor, authorization) {
    return Promise.resolve().then(() => {
        if (!rumor) {
            throw {
                message: 'No rumor to create.',
                id: 'NO_RUMOR'
            };
        }

        return Joi.validate(rumor, RumorValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given rumor is invalid.',
                id: 'INVALID_RUMOR',
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
                    message: 'Bearer of the token is not allowed to delete rumors.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        const rumor = await Rumor.findOne(query);
        if (!rumor) {
            throw {
                id: 'RUMOR_NOT_FOUND',
                message: 'Rumor was not found, or the user is not the owner of this rumor.',
                status: 404
            };
        }

        rumor.title = validated.title;
        rumor.description = validated.description;
        rumor.site = validated.site;
        rumor.last_update = new Date();
        rumor.contact = validated.contact;
        rumor.coordinates = validated.coordinates;

        return rumor.save();
    }).then(rumor => {
        return Rumor.findById(rumor._id, '-__v').populate('owner', 'username -_id');
    });
}

function deleteAll() {
    return Rumor.deleteMany({}).then(() => {
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