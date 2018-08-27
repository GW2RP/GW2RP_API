const Joi = require('joi');

const User = require('../models/User');
const Character = require('../models/Character');

const CharacterValidator = require('../validators/CharacterValidator');

function getAll(search) {
    return Promise.resolve().then(async () => {
        const query = {};
        if (search.name) {
            query['$text'] = {
                $search: search.name
            };
        }
        if (search.user) {
            const user = await User.findOne({ username: search.user }, '_id');
            if (!user) {
                throw {
                    id: 'USER_NOT_FOUND',
                    message: 'The user you tried to search on does not exists.',
                    status: 404
                };
            }
            query.owner = user._id;
        }
        if (search.tags) {
            query.tags = { $all: search.tags };
        }

        return Character.find(query, '-__v -sheet').populate('owner', 'username gw2_account -_id');
    });
}

function create(character, authorization) {
    return Promise.resolve().then(() => {
        if (!character) {
            throw {
                message: 'No character to create.',
                id: 'NO_CHARACTER'
            };
        }

        return Joi.validate(character, CharacterValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given character is invalid.',
                id: 'INVALID_CHARACTER',
                details
            };
        });
    }).then(validated => {
        const newCharacter = new Character(validated);

        // Find owner.
        return User
            .findOne({
                username: authorization.username
            }).then(user => {
                if (!user) {
                    throw {
                        id: 'USER_NOT_FOUND',
                        message: 'Bearer of the token is not allowed to create characters.',
                        status: 403
                    };
                }

                newCharacter.owner = user._id;

                return newCharacter.save();
            }).then(character => {
                return Character.findById(character._id, '-__v').populate('owner', '-_id username');
            });
    });
}

function getOne(id) {
    return Character.findById(id, '-__v').populate('owner', 'username gw2_account -_id').then(character => {
        if (!character) {
            throw {
                id: 'CHARACTER_NOT_FOUND',
                message: 'Character was not found.',
                status: 404
            };
        }

        return character;
    }).catch(() => {
        throw {
            id: 'CHARACTER_NOT_FOUND',
            message: 'Character was not found.',
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
                    message: 'Bearer of the token is not allowed to delete characters.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        return Character.deleteOne(query).then(({ n }) => {
            if (n === 0) {
                throw {
                    id: 'CHARACTER_NOT_FOUND',
                    message: 'Character was not found, or the user is not the owner of this character.',
                    status: 404
                };
            }
    
            return true;
        });  
    }).catch(err => {
        if (!err.id) {
            throw {
                id: 'CHARACTER_NOT_FOUND',
                message: 'Character was not found.',
                status: 404
            };
        }

        throw err;
    });
}

function updateOne(id, character, authorization) {
    return Promise.resolve().then(() => {
        if (!character) {
            throw {
                message: 'No character to create.',
                id: 'NO_CHARACTER'
            };
        }

        return Joi.validate(character, CharacterValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given character is invalid.',
                id: 'INVALID_CHARACTER',
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
                    message: 'Bearer of the token is not allowed to delete characters.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        const character = await Character.findOne(query);
        if (!character) {
            throw {
                id: 'CHARACTER_NOT_FOUND',
                message: 'Character was not found, or the user is not the owner of this character.',
                status: 404
            };
        }

        character.name = validated.name;
        character.description = validated.description;
        character.appearance = validated.appearance;
        character.history = validated.history;
        character.sheet = validated.sheet;
        character.last_update = new Date();
        character.tags = validated.tags;

        return character.save();
    }).then(character => {
        return Character.findById(character._id, '-__v').populate('owner', 'username gw2_account -_id');
    });
}

function deleteAll() {
    return Character.deleteMany({}).then(() => {
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