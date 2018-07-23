/////////////////////////////////////////
// MAIN ROUTER

const express = require('express');
const path = require('path');

const auth = require('./middlewares/auth');

module.exports = () => {
    const router = express.Router();

    router.get('/openapi.yml', (req, res, next) => {
        return res.sendFile(path.join(__dirname, './public/openapi.yml'));
    });

    router.get('/openapi', (req, res, next) => {
        return res.sendFile(path.join(__dirname, './public/openapi.html'));
    });

    router.post('/auth', auth.signIn());

    router.use('/users', require('./routers/users')({ auth }));

    router.use('/characters', require('./routers/characters')({ auth }));

    router.use('/guilds', require('./routers/guilds')({ auth }));

    router.use('/rumors', require('./routers/rumors')({ auth }));

    router.use('/locations', require('./routers/locations')({ auth }));

    router.use('/events', require('./routers/events')({ auth }));

    router.get('*', (req, res, next) => {
        return res.status(404).json({
            success: "false",
            message: "URL not found."
        });
    });

    router.use((err, req, res, next) => {
        console.error(err);

        if (!res.status || res.status[0] == 2) {
            res.status(500);
        }

        return res.json({ message: err.id ? err.message : "Internal Server Error.", error: err.id || 500 });
    });

    return router;
}
