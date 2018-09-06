/////////////////////////////////////////
// MAIN ROUTER FOR CONTRACTS

const express = require('express');

const Contracts = require('../controllers/contractController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.get('/', (req, res, next) => {
        const { user, title, status } = req.query;
        const search = { title, user, status };

        Contracts.getAll(search).then(contracts => { 
            return res.json({
                success: true,
                message: 'List of contracts.',
                contracts,
            });
        }).catch(next);
    });

    router.post('/search', (req, res, next) => {
        const { user, title, status } = req.body;
        const search = { title, user, status };

        Contracts.getAll(search).then(contracts => { 
            return res.json({
                success: true,
                message: 'List of contracts.',
                contracts,
            });
        }).catch(next);
    });

    router.delete('/', [auth.hasToken(), auth.isAdmin()], (req, res, next) => {
        return Contracts.deleteAll().then(() => { 
            return res.json({
                success: true,
                message: 'All contracts deleted.'
            });
        }).catch(next);
    });

    router.post('/', auth.hasToken(), (req, res, next) => {
        if (!req.body.contract) {
            return res.status(400).json({
                success: false,
                message: 'No contract in body.',
            });
        }
        Contracts.create(req.body.contract, req.authorization).then(contract => {
            return res.json({
                success: true,
                message: 'Contract created.',
                contract,
            });
        }).catch(next);
    });

    router.get('/:contractId', (req, res, next) => {
        return Contracts.getOne(req.params.contractId).then(contract => { 
            return res.json({
                success: true,
                message: 'Get contract.',
                contract,
            });
        }).catch(next);
    });

    router.delete('/:contractId', auth.hasToken(), (req, res, next) => {
        return Contracts.deleteOne(req.params.contractId, req.authorization).then(() => { 
            return res.json({
                success: true,
                message: 'Contract deleted.'
            });
        }).catch(next);
    });

    router.put('/:contractId', auth.hasToken(), (req, res, next) => {
        if (!req.body.contract) {
            return res.status(400).json({
                success: false,
                message: 'Missing contract in body.',
            });
        }

        return Contracts.updateOne(req.params.contractId, req.body.contract, req.authorization).then(contract => { 
            return res.json({
                success: true,
                message: 'Contract updated.',
                contract,
            });
        }).catch(next);
    });

    router.post('/:contractId/accept', auth.hasToken(), (req, res, next) => {
        Contracts.accept(req.params.contractId, req.authorization).then(contract => {
            return res.json({
                success: true,
                message: 'Contract accepted.'
            });
        }).catch(next);
    });

    router.post('/:contractId/decline', auth.hasToken(), (req, res, next) => {
        Contracts.decline(req.params.contractId, req.authorization).then(contract => {
            return res.json({
                success: true,
                message: 'Contract declined.'
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