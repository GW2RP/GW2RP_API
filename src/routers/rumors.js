/////////////////////////////////////////
// MAIN ROUTER FOR RUMORS

const express = require('express');

const Rumors = require('../controllers/rumorController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        const { user, title } = req.query;
        const search = { title, user };

        Rumors.getAll(search).then(rumors => { 
            return res.json({
                success: true,
                message: 'List of rumors.',
                rumors,
            });
        }).catch(next);
    });

    router.post('/search', (req, res, next) => {
        const { user, title } = req.body;
        const search = { title, user };

        Rumors.getAll(search).then(rumors => { 
            return res.json({
                success: true,
                message: 'List of rumors.',
                rumors,
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Rumors.deleteAll().then(() => { 
            return res.json({
                success: true,
                message: 'All rumors deleted.'
            });
        }).catch(next);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        if (!req.body.rumor) {
            return res.status(400).json({
                success: false,
                message: 'No rumor in body.',
            });
        }
        Rumors.create(req.body.rumor, req.authorization).then(rumor => {
            return res.json({
                success: true,
                message: 'Rumor created.',
                rumor,
            });
        }).catch(next);
    });

    router.get('/:rumorId', (req, res, next) => {
        return Rumors.getOne(req.params.rumorId).then(rumor => { 
            return res.json({
                success: true,
                message: 'Get rumor.',
                rumor,
            });
        }).catch(next);
    });

    router.delete('/:rumorId', auth.hasToken(), (req, res, next) => {
        return Rumors.deleteOne(req.params.rumorId, req.authorization).then(() => { 
            return res.json({
                success: true,
                message: 'Rumor deleted.'
            });
        }).catch(next);
    });

    router.put('/:rumorId', auth.hasToken(), (req, res, next) => {
        if (!req.body.rumor) {
            return res.status(400).json({
                success: false,
                message: 'Missing rumor in body.',
            });
        }

        return Rumors.updateOne(req.params.rumorId, req.body.rumor, req.authorization).then(rumor => { 
            return res.json({
                success: true,
                message: 'Rumor updated.',
                rumor,
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