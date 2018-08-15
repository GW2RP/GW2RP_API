/////////////////////////////////////////
// MAIN ROUTER FOR UNCATEGORIZED ROUTES

const express = require('express');

const Day = require('../controllers/dateController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/aujourdhui', (req, res, next) => {
        Day.getToday().then(today => {
            return res.json({
                success: true,
                message: 'Informations about today.',
                today,
            });
        }).catch(next);
    });

    router.get('/convertir/rp/:day/:month/:year', (req, res, next) => {
        try {
            const date = new Date();
            
            date.setFullYear(req.params.year);
            date.setMonth(req.params.month - 1);
            date.setDate(req.params.day);

            Day.getDay(date).then(day => {
                return res.json({
                    success: true,
                    message: "Day converted to ingame.",
                    day,
                });
            }).catch(next);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: "Date could not be parsed.",
            });
        }
    });

    router.get('/convertir/irl/:day/:season/:year', (req, res, next) => {
        try {
            const day = parseInt(req.params.day);
            const season = parseInt(req.params.season);
            const year = parseInt(req.params.year);

            Day.ig2irl({ day, season, year }).then(converted => {
                console.log(converted);
                return res.json({
                    success: true,
                    message: "Ingame date converted to irl.",
                    day: converted,
                });
            }).catch(next);
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: "Date could not be parsed.",
            });
        }
    });

    router.get('*', (req, res, next) => {
        return res.status(404).json({
            success: false,
            message: 'URL not found.'
        });
    });

    return router;
};