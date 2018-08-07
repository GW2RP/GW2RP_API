const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const UserValidator = require('../validators/UserValidator');

const mailer = require('../utils/mailer');

const secret = '26az1A1azd';

function signIn(username, password) {
    return Promise.resolve().then(() => {
        return User.findOne({
            username
        });
    }).then(user => {
        if (!user) {
            return {
                message: 'There is no user with this username.',
                id: 'NO_USER',
                status: 403
            };
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return {
                message: 'Wrong credential.',
                id: 'WRONG_CREDENTIALS',
                status: 403
            };
        }

        return signToken({
            username,
            admin: user.admin
        });
    });
}

function signToken(payload) {
    return jwt.sign(payload, secret, {
        expiresIn: '30d'
    });
}

function verifyToken(token) {
    return new Promise((resolve) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                throw {
                    message: 'Invalid token provided.',
                    id: 'INVALID_TOKEN'
                };
            }

            return resolve(decoded);
        });
    });
}

function createOne(user) {
    return Promise.resolve().then(() => {
        if (!user) {
            throw {
                message: 'No user to create.',
                id: 'NO_USER'
            };
        }

        return Joi.validate(user, UserValidator).then(validated => {
            if (!validated.password) {
                throw {
                    status: 400,
                    message: 'Given user is invalid.',
                    id: 'INVALID_USER',
                    details: [{
                        message: 'Missing password.',
                        id: 'MISSING_PASSWORD',
                        path: ['password']
                    }]
                };
            }

            // Hash password.
            const hash = bcrypt.hashSync(user.password, 8);
            validated.password = hash;

            return validated;
        }).catch(error => {
            // If password field is invalid, avoid sending the value back.
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message.includes('password') ? 'Field password is required. Must contain at least a letter, a capital letter, a digit, a special character, and be a least 8 characters long.' : d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: 'Given user is invalid.',
                id: 'INVALID_USER',
                details
            };
        });
    }).then(validated => {
        if (process.env.ADMIN_USER && validated.username.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
            validated.admin = true;
        }

        const newUser = new User(validated);

        return newUser.save();
    }).then(user => {
        const {
            username,
            register_date,
            status,
            gw2_account
        } = user;

        sendValidationMail(username).catch(err => {
            console.error(`Verification mail could not be sent to ${username}`);
            console.error(err);
        });

        return {
            username,
            register_date,
            status,
            gw2_account
        };
    }).catch(err => {
        if (err.name === 'MongoError' && err.message.includes('duplicate')) {
            throw {
                message: 'User already used (username, email and gw2_account must be unique).',
                id: 'EXISTING_USER',
                status: 400
            };
        }

        throw err;
    });
}

function getAll(search, authorization) {
    return Promise.resolve().then(() => {
        // Build query
        const query = {};
        if (search.text) {
            query['$text'] = {
                $search: search.text
            };
        }
        if (search.username) {
            query.username = search.username;
        }
        if (search.gw2_account) {
            query.gw2_account = search.gw2_account;
        }

        // Return result based of authorization.
        if (authorization.admin) {
            return User.find(query, '-_id -__v -password');
        } else {
            return User.find(query, '-_id username gw2_account');
        }
    });
}

function deleteAll() {
    return User.deleteMany({}).then(result => {
        return result.n;
    });
}

function getOne(username) {
    return User.findOne({
        username
    }, '-_id username gw2_account').then(user => {
        if (!user) {
            throw {
                message: 'No user found.',
                id: 'USER_NOT_FOUND',
                status: 404
            };
        }

        return user;
    });
}

function deleteOne(username, authorization) {
    return Promise.resolve().then(() => {
        console.log(authorization);
        if (!authorization || !(authorization.admin || (authorization.username.toLowerCase() === username.toLowerCase()))) {
            throw {
                message: 'You cannot delete another acount than yours.',
                id: 'NOT_YOUR_ACCOUNT',
                status: '403'
            };
        }

        return User.deleteOne({
            username
        }).then(result => {
            if (result.n === 1) {
                return true;
            } else {
                throw {
                    message: 'No user found.',
                    id: 'USER_NOT_FOUND',
                    status: 404
                };
            }
        });
    });
}

function updateOne(username, user, oldPassword) {
    return Promise.resolve().then(() => {
        if (!user) {
            throw {
                message: 'No user data to update.',
                id: 'NO_USER_DATA',
                status: 400
            };
        }

        return User.findOne({
            username
        });
    }).then(found => {
        if (!found) {
            throw {
                message: 'No user to update.',
                id: 'NO_USER',
                status: 404
            };
        }

        return Joi.validate(user, UserValidator).then(validated => {
            if (validated.password || validated.email) {
                // Check old password.
                if (!oldPassword) {
                    throw {
                        message: 'Updating password or email requires password_confirmation in body.',
                        id: 'PASSWORD_REQUIRED',
                        status: 403
                    };
                }

                if (!bcrypt.compareSync(oldPassword, found.password)) {
                    throw {
                        message: 'old_password is wrong.',
                        id: 'WRONG_CREDENTIALS',
                        status: 403
                    };
                }
            }

            if (validated.password) {
                // Hash password.
                const hash = bcrypt.hashSync(user.password, 8);
                validated.password = hash;
            }

            return validated;
        }).catch(error => {
            // If password field is invalid, avoid sending the value back.
            const details = error.details ? error.details.map(d => {
                return {
                    message: d.message.includes('password') ? 'Field password is required. Must contain at least a letter, a capital letter, a digit, a special character, and be a least 8 characters long.' : d.message,
                    id: d.path && d.path[0] ? d.path[0] : 'GENERIC'
                };
            }) : null;

            throw {
                status: 400,
                message: error.id ? error.message : 'Given user is invalid.',
                id: error.id || 'INVALID_USER',
                details
            };
        }).then(validated => {

            found.username = validated.username;
            found.email = validated.email;
            found.password = validated.password;
            found.gw2_account = validated.gw2_account;

            return found.save();
        });
    }).then(user => {
        const {
            username,
            register_date,
            status,
            gw2_account,
            email
        } = user;

        return {
            username,
            register_date,
            status,
            gw2_account,
            email
        };
    }).catch(err => {
        if (err.name === 'MongoError' && err.message.includes('duplicate')) {
            throw {
                message: 'User already used (username, email and gw2_account must be unique).',
                id: 'EXISTING_USER',
                status: 400
            };
        }

        throw err;
    });
}

function sendValidationMail(username) {
    return User.findOne({
        username
    }).then(user => {
        if (!user) {
            throw {
                message: 'No user found.',
                id: 'USER_NOT_FOUD',
                status: 404
            };
        }

        if (user.status === 'active') {
            throw {
                message: 'User account is already validated.',
                id: 'USER_ALREADY_ACTIVE',
                status: 403
            };
        }
        if (user.status === 'banned') {
            throw {
                message: 'User account is banned.',
                id: 'USER_BANNED',
                status: 403
            };
        }

        user.validation_token = (Math.random().toString(16).substr(2) + Math.random().toString(16).substr(2));

        return user.save();
    }).then(user => {
        const link = `${process.env.URL}/validate/${username}/${user.validation_token}`;

        let mailOptions = {
            from: '"Abaddon, la Voix des Brumes" <noreply@gw2rp-tools.ovh>',
            to: user.email,
            subject: 'Confirmation de compte GW2RP-Tools',
            text: 'Bienvenue sur la boîte à outils GW2RP-Tools ! Merci de confirmer votre adresse email en cliquant sur le lien suivant pour activer votre compte : ',
            html: `<p>Bienvenue sur la boîte à outils GW2RP-Tools !</p><p>Merci de confirmer votre adresse email en cliquant sur le lien suivant pour activer votre compte :<br/><a href="${link}">${link}</a></p>`
        };

        return mailer.sendMail(mailOptions).then(() => {
            console.info(`Verification mail sent to ${username}.`);
            return;
        });
    });
}

function validateEmail(username, token) {
    return User.findOne({
        username
    }).then(user => {
        if (!user) {
            return {
                success: false,
                message: 'No user found.',
                id: 'USER_NOT_FOUND'
            };
        }

        if (user.validation_token !== token) {
            return {
                success: false,
                message: 'Token is invalid.',
                id: 'INVALID_TOKEN'
            };
        }

        if (user.status === 'active') {
            return {
                success: false,
                message: 'Account already active.',
                id: 'USER_ALREADY_ACTIVE'
            };
        }

        if (user.status === 'banned') {
            return {
                success: false,
                message: 'User account is banned.',
                id: 'USER_BANNED'
            };
        }

        user.validation_token = '';
        user.status = 'active';

        return user.save().then(() => {
            return {
                success: true
            };
        });
    });
}

module.exports = {
    signIn,
    verifyToken,
    signToken,
    createOne,
    getAll,
    deleteAll,
    getOne,
    deleteOne,
    updateOne,
    sendValidationMail,
    validateEmail,
};