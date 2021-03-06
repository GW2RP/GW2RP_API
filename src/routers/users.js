/////////////////////////////////////////
// MAIN ROUTER FOR USERS

const express = require('express');

const Users = require('../controllers/userController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        // Build search query.
        const username = req.query.username;
        const gw2_account = req.query.gw2_account;
        const text = req.query.q;
        const search = { username, gw2_account, text };

        return Users.getAll(search, req.authorization).then(users => {
            return res.json({
                success: true,
                message: 'List of users.',
                users
            });
        }).catch(next);
    });

    router.post('/search', (req, res, next) => {
        // Build search query.
        const username = req.body.username;
        const gw2_account = req.body.gw2_account;
        const text = req.body.q;
        const search = { username, gw2_account, text };

        return Users.getAll(search, req.authorization).then(users => {
            return res.json({
                success: true,
                message: 'List of users.',
                users
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Users.deleteAll().then(amount => {
            return res.json({
                success: true,
                message: `All users deleted (deleted: ${amount}).`
            });
        }).catch(next);
    });

    router.get('/:username', (req, res, next) => {
        return Users.getOne(req.params.username).then(user => {
            return res.json({
                success: true,
                user
            });
        }).catch(next);
    });

    router.delete('/:username', auth.hasToken(), (req, res, next) => {
        return Users.deleteOne(req.params.username, req.authorization).then(result => {
            return res.json({
                success: true,
                message: 'User deleted.'
            });
        }).catch(next);
    });

    router.put('/:username', auth.hasToken(), (req, res, next) => {
        return Users.updateOne(
            req.params.username,
            req.body.user,
            req.body.old_password
        ).then(user => {
            return res.json({
                success: true,
                message: 'User updated',
                user
            });
        }).catch(next);
    });

    router.get('/:username/creations', (req, res, next) => {
        Users.getCreations(req.params.username).then(creations => {
            return res.json({
                success: true,
                message: `Creations of ${req.params.username}.`,
                creations,
            });
        }).catch(next);
    });

    router.get('/:username/subscriptions', auth.hasToken(), (req, res, next) => {
        Users.getSubscriptions(req.params.username, req.authorization).then(user => {
            return res.json({
                success: true,
                message: 'User object with subscriptions.',
                user
            });
        }).catch(next);
    });

    router.put('/:username/subscriptions', auth.hasToken(), (req, res, next) => {
        Users.updateSubscriptions(req.params.username, req.body.subscriptions, req.authorization).then(subscriptions => {
            return res.json({
                success: true,
                message: 'Subscriptions updated.',
                subscriptions,
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