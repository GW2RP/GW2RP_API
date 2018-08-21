/////////////////////////////////////////
// MAIN ROUTER FOR EVENTS

const express = require('express');

const Events = require('../controllers/eventController');

module.exports = ({ auth }) => {
    const router = express.Router();

    /** @api Get the events.
     * 
     * ?passed=true (default false) - return only passed events.
     * ?all=true (default false) - return all events.
     * ?oncoming=true (default true) - return only oncoming events.
     * ?user=String - filter by author.
     * ?mines=true (default false) - get only the events of the bearer of the token.
     * ?date=dd/mm/yyyy - filter by date.
     */
    router.get('/', (req, res, next) => {
        const { user, title } = req.query;
        const search = { title, user };

        Events.getAll(search).then(events => { 
            return res.json({
                success: true,
                message: 'List of events.',
                events,
            });
        }).catch(next);
    });

    /** @api Perform a search on events.
     * Same parameters as the GET route, but allowing more complexe queries in body.
     * 
     */
    router.post('/search', (req, res, next) => {
        const { user, title } = req.body;
        const search = { title, user };

        Events.getAll(search).then(events => { 
            return res.json({
                success: true,
                message: 'List of events.',
                events,
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Events.deleteAll().then(() => { 
            return res.json({
                success: true,
                message: 'All events deleted.'
            });
        }).catch(next);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        if (!req.body.event) {
            return res.status(400).json({
                success: false,
                message: 'No event in body.',
            });
        }
        Events.create(req.body.event, req.authorization).then(event => {
            return res.json({
                success: true,
                message: 'Event created.',
                event,
            });
        }).catch(next);
    });

    router.get('/:eventId', (req, res, next) => {
        return Events.getOne(req.params.eventId).then(event => { 
            return res.json({
                success: true,
                message: 'Get event.',
                event,
            });
        }).catch(next);
    });

    router.delete('/:eventId', auth.hasToken(), (req, res, next) => {
        return Events.deleteOne(req.params.eventId, req.authorization).then(() => { 
            return res.json({
                success: true,
                message: 'Event deleted.'
            });
        }).catch(next);
    });

    router.put('/:eventId', auth.hasToken(), (req, res, next) => {
        if (!req.body.event) {
            return res.status(400).json({
                success: false,
                message: 'Missing event in body.',
            });
        }

        return Events.updateOne(req.params.eventId, req.body.event, req.authorization).then(event => { 
            return res.json({
                success: true,
                message: 'Event updated.',
                event,
            });
        }).catch(next);
    });

    router.post('/:eventId/participate/:participation', auth.hasToken(), (req, res, next) => {
        const { eventId, participation } = req.params;

        Events.participate(eventId, participation, req.authorization).then(() => {
            return res.json({
                success: true,
                message: 'Participation accounted',
                participation,
            });
        }).catch(next);
    });

    router.use('*', (req, res, next) => {
        return res.status(404).json({
            success: 'false',
            message: 'URL not found.'
        });
    });

    return router;
};