const Joi = require('joi');

module.exports = Joi.object().keys({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string(),
    email: Joi.string().email().required()
});
