/////////////////////////////////////////
// MAIN ROUTER FOR CHARACTERS

const express = require('express');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        return res.json({
            success: true,
            message: "List of characters.",
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

    router.get('/:characterId', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/:characterId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.put('/:characterId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    return router;
}