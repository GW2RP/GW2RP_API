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

    return router;
}