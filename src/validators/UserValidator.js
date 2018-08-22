const Joi = require('joi');

module.exports = Joi.object().keys({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, 'password'),
    email: Joi.string().email().required(),
    gw2_account: Joi.string().regex(/^[a-zA-Z ]{1,}\.\d{4}$/, 'gw2account').required(),
    status: Joi.forbidden(),
    register_date: Joi.forbidden(),
    last_connect: Joi.forbidden(),
    admin: Joi.forbidden(),
    validation_token: Joi.forbidden(),
});
