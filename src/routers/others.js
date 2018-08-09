/////////////////////////////////////////
// MAIN ROUTER FOR UNCATEGORIZED ROUTES

const express = require('express');

const Day = require('../controllers/dateController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/aujourdhui', (req, res, next) => {
        Day.getDay(new Date()).then(today => {
            return res.json({
                success: true,
                message: 'Informations about today.',
                today
            });
        }).catch(next);
    });

    router.get('*', (req, res, next) => {
        return res.status(404).json({
            success: false,
            message: 'URL not found.'
        });
    });

    return router;
};