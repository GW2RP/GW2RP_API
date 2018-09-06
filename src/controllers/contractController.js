const Joi = require('joi');

const User = require('../models/User');
const Contract = require('../models/Contract');
const ContractValidator = require('../validators/ContractValidator');

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
        switch (search.status) {
            case 'ALL':
                break;
            case 'CLOSED':
                query['status'] = 'CLOSED';
                break;
            case 'OPEN':
            default:
                query['status'] = 'OPEN';
                break;
        }

        return Contract.find(query, '-__v').populate('owner', 'username -_id').populate('pretenders', 'username -_id');
    });
}

function create(contract, authorization) {
    return Promise.resolve().then(() => {
        if (!contract) {
            throw {
                message: 'No contract to create.',
                id: 'NO_CONTRACT'
            };
        }

        return Joi.validate(contract, ContractValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given contract is invalid.',
                id: 'INVALID_CONTRACT',
                details
            };
        });
    }).then(validated => {
        const newContract = new Contract(validated);

        // Find owner.
        return User
            .findOne({
                username: authorization.username
            }).then(user => {
                if (!user) {
                    throw {
                        id: 'USER_NOT_FOUND',
                        message: 'Bearer of the token is not allowed to create contracts.',
                        status: 403
                    };
                }

                newContract.owner = user._id;

                return newContract.save();
            }).then(contract => {
                return Contract.findById(contract._id, '-__v').populate('owner', '-_id username');
            });
    });
}

function getOne(id) {
    return Contract.findById(id, '-__v').populate('owner', 'username -_id').populate('pretenders', 'username -_id').then(contract => {
        if (!contract) {
            throw {
                id: 'CONTRACT_NOT_FOUND',
                message: 'Contract was not found.',
                status: 404
            };
        }

        return contract;
    }).catch(err => {
        throw {
            id: 'CONTRACT_NOT_FOUND',
            message: 'Contract was not found.',
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
                    message: 'Bearer of the token is not allowed to delete contracts.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        return Contract.deleteOne(query).then(({ n, ok }) => {
            if (n === 0) {
                throw {
                    id: 'CONTRACT_NOT_FOUND',
                    message: 'Contract was not found, or the user is not the owner of this contract.',
                    status: 404
                };
            }
    
            return true;
        });  
    }).catch(err => {
        if (!err.id) {
            throw {
                id: 'CONTRACT_NOT_FOUND',
                message: 'Contract was not found.',
                status: 404
            };
        }

        throw err;
    });
}

function updateOne(id, contract, authorization) {
    return Promise.resolve().then(() => {
        if (!contract) {
            throw {
                message: 'No contract to create.',
                id: 'NO_CONTRACT'
            };
        }

        return Joi.validate(contract, ContractValidator).catch(error => {
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given contract is invalid.',
                id: 'INVALID_CONTRACT',
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
                    message: 'Bearer of the token is not allowed to delete contracts.',
                    status: 403
                };
            }

            query.owner = user._id;
        }

        const contract = await Contract.findOne(query);
        if (!contract) {
            throw {
                id: 'CONTRACT_NOT_FOUND',
                message: 'Contract was not found, or the user is not the owner of this contract.',
                status: 404
            };
        }

        contract.title = validated.title;
        contract.description = validated.description;
        contract.site = validated.site;
        contract.last_update = new Date();
        contract.reward = validated.reward;
        contract.status = validated.status;

        return contract.save();
    }).then(contract => {
        return Contract.findById(contract._id, '-__v').populate('owner', 'username -_id');
    });
}

function deleteAll() {
    return Contract.deleteMany({}).then(() => {
        return true;
    });
}

function accept(id, authorization) {
    return Promise.resolve().then(() => {
        return User.findOne({
            username: authorization.username,
        });
    }).then(user => {
        if (!user) {
            throw {
                id: 'USER_NOT_FOUND',
                message: 'The user does not exist.',
                status: 404,
            };
        }

        return Promise.all([user, Contract.findById(id)]);
    }).then(([user, contract]) => {
        if (!contract) {
            throw {
                id: 'CONTRACT_NOT_FOUND',
                message: 'The contract does not exist.',
                status: 404,
            };
        }

        const index = contract.pretenders.findIndex(e => e.toString() === user._id.toString());

        if (index === -1) {
            contract.pretenders.push(user._id);
        }

        return contract.save();
    });
}

function decline(id, authorization) {
    return Promise.resolve().then(() => {
        return User.findOne({
            username: authorization.username,
        });
    }).then(user => {
        if (!user) {
            throw {
                id: 'USER_NOT_FOUND',
                message: 'The user does not exist.',
                status: 404,
            };
        }

        return Promise.all([user, Contract.findById(id)]);
    }).then(([user, contract]) => {
        if (!contract) {
            throw {
                id: 'CONTRACT_NOT_FOUND',
                message: 'The contract does not exist.',
                status: 404,
            };
        }

        const index = contract.pretenders.findIndex(e => e.toString() === user._id.toString());

        if (index === -1) {
            return contract;
        }

        contract.pretenders.splice(index, 1);
        
        return contract.save();
    });
}

module.exports = {
    getAll,
    create,
    getOne,
    deleteOne,
    deleteAll,
    updateOne,
    accept,
    decline,
};