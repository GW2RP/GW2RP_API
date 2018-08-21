const Joi = require('joi');

module.exports = Joi.object().keys({
    title: Joi.string().min(1).required(),
    created_date: Joi.date().forbidden(),
    last_update: Joi.date().forbidden(),
    owner: Joi.forbidden(),
    description: Joi.string().min(1).required(),
    coordinates: Joi.object().keys({
        x: Joi.number().required(),
        y: Joi.number().required()
    }).required(),
    contact: Joi.string().regex(/^[a-zA-Z ]{1,}\.\d{4}$/, 'gw2account').required(),
    site: Joi.string().allow(''),
    types: Joi.array().required(),
    icon: Joi.string().required(),
    opening_hours: Joi.object(),
});
