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

    return router;
}