const jwt = require("jsonwebtoken");
const Joi = require('joi');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const UserValidtor = require('../validators/UserValidator');

const secret = "26az1A1azd";

function signIn(username, password) {
    return Promise.resolve().then(() => {
        return User.findOne({ username });
    }).then(user => {
        if (!user) {
            return { message: "There is no user with this username.", id: "NO_USER", status: 403 };
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return { message: "Wrong credential.", id: "WRONG_CREDENTIALS", status: 403 };
        }

        return signToken({ username, admin: user.admin });
    })
}

function signToken(payload) {
    return jwt.sign(payload, secret, { expiresIn: '30d' });
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                throw { message: "Invalid token provided.", id: "INVALID_TOKEN" };
            }

            return resolve(decoded);
        });
    });
}

function createOne(user) {
    return Promise.resolve().then(() => {
        if (!user) {
            throw { message: "No user to create.", id: "NO_USER" };
        }

        return Joi.validate(user, UserValidtor).then(validated => {
            if (!validated.password) {
                throw {
                    status: 400,
                    message: "Given user is invalid.",
                    id: "INVALID_USER",
                    details: [ {
                        message: "Missing password.",
                        id: "MISSING_PASSWORD",
                        path: ["password"]
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
                    message: d.message.includes('password') ? "Field password is required. Must contain at least a letter, a capital letter, a digit, a special character, and be a least 8 characters long." : d.message,
                    id: d.path && d.path[0] ? d.path[0] : "GENERIC"
                };
            }) : null;

            throw {
                status: 400,
                message: "Given user is invalid.",
                id: "INVALID_USER",
                details
            };
        });
    }).then(validated => {
        if (validated.username === process.env.ADMIN_USER) {
            validated.admin = true;
        }
        
        const newUser = new User(validated);

        return newUser.save();
    }).then(user => {
        const { username, register_date, status, gw2_account } = user;
        
        return { username, register_date, status, gw2_account };
    }).catch(err => {
        if (err.name === "MongoError" && err.message.includes("duplicate")) {
            throw { message: "User already used (username, email and gw2_account must be unique).", id: "EXISTING_USER", status: 400 };
        }

        throw err;
    });
}

function getAll(search, authorization) {
    return Promise.resolve().then(() => {
        // Build query
        const query = {};
        if (search.text) {
            query["$text"] = { $search: search.text };
        }
        if (search.username) {
            query.username = search.username;
        }
        if (search.gw2_account) {
            query.gw2_account = search.gw2_account;
        }

        // Return result based of authorization.
        if (authorization.admin) {
            return User.find(query, "-_id -__v -password");
        } else if (authorization.username) {
            return User.find(query, "-_id -__v -password -last_connect -status -email");
        } else {
            return User.find(query, "-_id -__v -password -last_connect -register_date -status -email");
        }
    });
}

function deleteAll(username) {
    return User.deleteMany({}).then(result => {
        return result.n;
    });
}

function getOne(username) {
    return User.findOne({ username }, "-_id username gw2_account").then(user => {
        if (!user) {
            throw { message: "No user found.", id: "USER_NOT_FOUND", status: 404 };
        }

        return user;
    });
}

function deleteOne(username) {
    return User.deleteOne({ username }).then(result => {
        if (result.n === 1) {
            return true;
        } else {
            throw { message: "No user found.", id: "USER_NOT_FOUND", status: 404 };
        }
    });
}

function updateOne(username, user, oldPassword) {
    return Promise.resolve().then(() => {
        if (!user) {
            throw { message: "No user data to update.", id: "NO_USER_DATA", status: 400 };
        }

        return User.findOne({ username });
    }).then(found => {
        if (!found) {
            throw { message: "No user to update.", id: "NO_USER", status: 404 };
        }

        return Joi.validate(user, UserValidtor).then(validated => {
            if (validated.password || validated.email) {
                // Check old password.
                if (!oldPassword) {
                    throw { message: "Updating password or email requires password_confirmation in body.", id: "PASSWORD_REQUIRED", status: 403 };
                }

                if (!bcrypt.compareSync(oldPassword, found.password)) {
                    throw { message: "old_password is wrong.", id: "WRONG_CREDENTIALS", status: 403 };
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
                    message: d.message.includes('password') ? "Field password is required. Must contain at least a letter, a capital letter, a digit, a special character, and be a least 8 characters long." : d.message,
                    id: d.path && d.path[0] ? d.path[0] : "GENERIC"
                };
            }) : null;

            throw {
                status: 400,
                message: error.id ? error.message : "Given user is invalid.",
                id: error.id || "INVALID_USER",
                details
            };
        }).then(validated => {
            
            found.username = validated.username;
            found.email = validated.email;
            found.password = validated.password;
            found.gw2_account = validated.gw2_account;

            return found.save();
        })
    }).then(user => {
        const { username, register_date, status, gw2_account, email } = user;

        return { username, register_date, status, gw2_account, email };
    }).catch(err => {
        if (err.name === "MongoError" && err.message.includes("duplicate")) {
            throw { message: "User already used (username, email and gw2_account must be unique).", id: "EXISTING_USER", status: 400 };
        }

        throw err;
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
}