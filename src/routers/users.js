/////////////////////////////////////////
// MAIN ROUTER FOR USERS

const express = require('express');

const Users = require('../controllers/userController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        return res.json({
            success: true,
            message: "List of users.",
            rumors: []
        });
    });

    router.post('/search', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return res.sendStatus(501);
    });

    router.get('/:username', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/:username', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.put('/:username', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.use('*', (req, res, next) => {
        return res.status(404).json({
            success: "false",
            message: "URL not found."
        });
    });

    return router;
}