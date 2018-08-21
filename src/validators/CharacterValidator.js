const Joi = require('joi');

module.exports = Joi.object().keys({
    name: Joi.string().min(1).required(),
    created_date: Joi.date().forbidden(),
    last_update: Joi.date().forbidden(),
    owner: Joi.forbidden(),
    description: Joi.string().min(1).required(),
    appearance: Joi.string().required(),
    history: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    sheet: Joi.object().keys({
        characteristics: Joi.array().items(Joi.object().keys({
            name: Joi.string().min(1).required(),
            value: Joi.number().required(),
            remark: Joi.string(),
        })).required(),
        skills: Joi.array().items(Joi.object().keys({
            name: Joi.string().min(1).required(),
            value: Joi.number().required(),
            remark: Joi.string(),
        })).required(),
        feats: Joi.array().items(Joi.object().keys({
            name: Joi.string().min(1).required(),
            remark: Joi.string().min(1).required(),
        })).required(),
    }).required(),
});
