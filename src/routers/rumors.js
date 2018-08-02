/////////////////////////////////////////
// MAIN ROUTER FOR RUMORS

const express = require('express');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        return res.json({
            success: true,
            message: "List of rumors.",
            rumors: []
        });
    });

    router.post('/search', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return res.sendStatus(501);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.get('/:rumorId', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/:rumorId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.put('/:rumorId', auth.hasToken(), (req, res, next) => {
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