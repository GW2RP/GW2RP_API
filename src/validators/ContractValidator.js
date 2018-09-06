const Joi = require('joi');

module.exports = Joi.object().keys({
    title: Joi.string().min(1).required(),
    created_date: Joi.date().forbidden(),
    last_update: Joi.date().forbidden(),
    owner: Joi.forbidden(),
    type: Joi.string().lowercase().min(1).required(),
    description: Joi.string().min(1).required(),
    site: Joi.string().allow(''),
    reward: Joi.string().required(),
    predenters: Joi.forbidden(),
    status: Joi.string().default('OPEN').valid(['OPEN', 'CLOSED']),
});
