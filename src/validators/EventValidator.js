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
    difficulty: Joi.string().lowercase().valid(['peaceful', 'easy', 'normal', 'difficult', 'hardcore']).required(),
    contact: Joi.string().regex(/^[a-zA-Z ]{1,}\.\d{4}$/, 'gw2account').required(),
    site: Joi.string().allow(''),
    types: Joi.array().required(),
    icon: Joi.string().required(),
    dates: Joi.object().keys({
        start: Joi.date().required(),
        end: Joi.date().required(),
        recursivity: Joi.string().uppercase().default('NONE').valid(['NONE', '1-WEEK', '2-WEEK', '3-WEEK', '4-WEEK']),
    }).required(),
    participants: Joi.forbidden(),
});
