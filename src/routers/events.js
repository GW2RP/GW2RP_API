/////////////////////////////////////////
// MAIN ROUTER FOR EVENTS

const express = require('express');

module.exports = ({ auth }) => {
    const router = express.Router();

    /** @api Get the events.
     * 
     * ?passed=true (default false) - return only passed events.
     * ?all=true (default false) - return all events.
     * ?oncoming=true (default true) - return only oncoming events.
     * ?author=String - filter by author.
     * ?mines=true (default false) - get only the events of the bearer of the token.
     * ?date=dd/mm/yyyy - filter by date.
     */
    router.get('/', (req, res, next) => {
        return res.json({
            success: true,
            message: "List of events.",
            rumors: []
        });
    });

    /** @api Perform a search on events.
     * Same parameters as the GET route, but allowing more complexe queries in body.
     * 
     */
    router.post('/search', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return res.sendStatus(501);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.get('/:eventId', (req, res, next) => {
        return res.sendStatus(501);
    });

    router.delete('/:eventId', auth.hasToken(), (req, res, next) => {
        return res.sendStatus(501);
    });

    router.put('/:eventId', auth.hasToken(), (req, res, next) => {
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