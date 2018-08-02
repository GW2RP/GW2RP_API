const jwt = require("jsonwebtoken");
const Joi = require('joi');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const UserValidtor = require('../validators/UserValidator');

const secret = "26az1A1azd";

function signIn(username, password) {
    return Promise.resolve().then(() => {
        if (username.toLowerCase() !== "nakasar") {
            return { message: "There is no user with this username.", id: "NO_USER" };
        }
        if (password !== "Password0") {
            return { message: "Password is not valid.", id: "BAD_CREDENTIALS" };
        }
        return signToken({ username: "nakasar", admin: true });
    });
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
                message: "Given user is invalid.",
                id: "INVALID_USER",
                details
            };
        });
    }).then(validated => {
        const newUser = new User(validated);
        console.log(newUser);

        return newUser;
    });
}

function deleteOne(username) {
    return Promise.reject();
}

function updateOne(username, user) {
    return Promise.reject();
}

function deleteAll(username) {
    return Promise.reject();
}

module.exports = {
    signIn,
    verifyToken,
    signToken,
    createOne,
    deleteOne,
    updateOne,
    deleteAll
}