/////////////////////////////////////////
// MAIN ROUTER FOR GUILDS

const express = require('express');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        return res.json({
            success: true,
            message: "List of guilds.",
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

    router.get('/:guildId', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/:guildId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.put('/:guildId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    return router;
}