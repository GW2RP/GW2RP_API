/////////////////////////////////////////
// MAIN ROUTER FOR LOCATIONS

const express = require('express');

const Locations = require('../controllers/locationController');

module.exports = ({ auth }) => {
    const router = express.Router();

    /** @api Get the locations.
     *
     * ?user=String - filter by author.
     * ?mines=true (default false) - get only the locations of the bearer of the token.
     */
    router.get('/', (req, res, next) => {
        const { user, title } = req.query;
        const search = { title, user };

        Locations.getAll(search).then(locations => { 
            return res.json({
                success: true,
                message: 'List of locations.',
                locations,
            });
        }).catch(next);
    });

    /** @api Perform a search on locations.
     * Same parameters as the GET route, but allowing more complexe queries in body.
     * 
     */
    router.post('/search', (req, res, next) => {
        const { user, title } = req.body;
        const search = { title, user };

        Locations.getAll(search).then(locations => { 
            return res.json({
                success: true,
                message: 'List of locations.',
                locations,
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Locations.deleteAll().then(() => { 
            return res.json({
                success: true,
                message: 'All locations deleted.'
            });
        }).catch(next);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        if (!req.body.location) {
            return res.status(400).json({
                success: false,
                message: 'No location in body.',
            });
        }
        Locations.create(req.body.location, req.authorization).then(location => {
            return res.json({
                success: true,
                message: 'Location created.',
                location,
            });
        }).catch(next);
    });

    router.get('/:locationId', (req, res, next) => {
        return Locations.getOne(req.params.locationId).then(location => { 
            return res.json({
                success: true,
                message: 'Get location.',
                location,
            });
        }).catch(next);
    });

    router.delete('/:locationId', auth.hasToken(), (req, res, next) => {
        return Locations.deleteOne(req.params.locationId, req.authorization).then(() => { 
            return res.json({
                success: true,
                message: 'Location deleted.'
            });
        }).catch(next);
    });

    router.put('/:locationId', auth.hasToken(), (req, res, next) => {
        if (!req.body.location) {
            return res.status(400).json({
                success: false,
                message: 'Missing location in body.',
            });
        }

        return Locations.updateOne(req.params.locationId, req.body.location, req.authorization).then(location => { 
            return res.json({
                success: true,
                message: 'Location updated.',
                location,
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