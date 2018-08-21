/////////////////////////////////////////
// MAIN ROUTER FOR CHARACTERS

const express = require('express');

const Characters = require('../controllers/characterController');

module.exports = ({ auth }) => {
    const router = express.Router();

    /** @api Get the characters.
     * 
     * ?name=String - search by Character name.
     * ?user=String - filter by author.
     * ?tags=[String] - filter by tags.
     */
    router.get('/', (req, res, next) => {
        const { user, name, tags } = req.query;
        const search = { name, user, tags };

        Characters.getAll(search).then(characters => { 
            return res.json({
                success: true,
                message: 'List of characters.',
                characters,
            });
        }).catch(next);
    });

    /** @api Perform a search on characters.
     * Same parameters as the GET route, but allowing more complexe queries in body.
     * 
     */
    router.post('/search', (req, res, next) => {
        const { user, name, tags } = req.body;
        const search = { name, user, tags };

        Characters.getAll(search).then(characters => { 
            return res.json({
                success: true,
                message: 'List of characters.',
                characters,
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Characters.deleteAll().then(() => { 
            return res.json({
                success: true,
                message: 'All characters deleted.'
            });
        }).catch(next);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        if (!req.body.character) {
            return res.status(400).json({
                success: false,
                message: 'No character in body.',
            });
        }
        Characters.create(req.body.character, req.authorization).then(character => {
            return res.json({
                success: true,
                message: 'Character created.',
                character,
            });
        }).catch(next);
    });

    router.get('/:characterId', (req, res, next) => {
        return Characters.getOne(req.params.characterId).then(character => { 
            return res.json({
                success: true,
                message: 'Get character.',
                character,
            });
        }).catch(next);
    });

    router.delete('/:characterId', auth.hasToken(), (req, res, next) => {
        return Characters.deleteOne(req.params.characterId, req.authorization).then(() => { 
            return res.json({
                success: true,
                message: 'Character deleted.'
            });
        }).catch(next);
    });

    router.put('/:characterId', auth.hasToken(), (req, res, next) => {
        if (!req.body.character) {
            return res.status(400).json({
                success: false,
                message: 'Missing character in body.',
            });
        }

        return Characters.updateOne(req.params.characterId, req.body.character, req.authorization).then(character => { 
            return res.json({
                success: true,
                message: 'Character updated.',
                character,
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