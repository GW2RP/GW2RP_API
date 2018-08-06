/////////////////////////////////////////
// MAIN ROUTER FOR ACCOUNT VALIDATION

const express = require('express');
const path = require('path');

const Users = require('../controllers/userController');

module.exports = ({ auth }) => {
    const router = express.Router();

    router.post('/:username', (req, res, next) => {
        Users.sendValidationMail(req.params.username).then(() => {
            return res.json({
                success: true,
                message: "Validation mail sent, please check your email."
            });
        }).catch(next);
    });
    
    router.get('/:username/:token', (req, res, next) => {
        Users.validateEmail(req.params.username, req.params.token).then(result => {
            if (result.success) {
                return res.sendFile(path.join(__dirname, '../public/validation/validationsuccess.html'));
            } else {
                return res.sendFile(path.join(__dirname, '../public/validation/validationfailed.html'));
            }
        }).catch(err => {
            return res.sendFile(path.join(__dirname, '../public/validation/validationerror.html'));
        });
    });

    return router;
}