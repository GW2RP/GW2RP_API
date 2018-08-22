const Joi = require('joi');

module.exports = Joi.object().keys({
    email: Joi.object().keys({
        expirations: Joi.boolean().required(),
    }).required(),
});
