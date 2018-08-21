const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CharacterSchema = new Schema({
    name: {
        type: String,
        require: 'A Character shall have a name.'
    },
    created_date: {
        type: Date,
        default: new Date()
    },
    last_update: {
        type: Date,
        default: new Date()
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: 'A Character shall have an owner.'
    },
    description: {
        type: String,
        required: 'A Character shall have an appearance.',
    },
    appearance: {
        type: String,
        required: 'A Character shall have an appearance.',
    },
    history: {
        type: String,
        required: 'A Character shall have an history.',
    },
    tags: {
        type: [String],
    },
    sheet: {
        _id: false,
        characteristics: [{
            _id: false,
            name: {
                type: String,
                required: 'A characteristic should have a name.',
            },
            value: {
                type: Number,
                required: 'A characteristic should have a value.',
            },
            remark: {
                type: String,
            },
        }],
        skills: [{
            _id: false,
            name: {
                type: String,
                required: 'A skill should have a name.',
            },
            value: {
                type: Number,
                required: 'A skill should have a value.',
            },
            remark: {
                type: String,
            },
        }],
        feats: [{
            _id: false,
            name: {
                type: String,
                required: 'A Feat shoud have a name.',
            },
            type: {
                type: String,
                enum: ['PASSIVE', 'ACTIVE'],
                required: 'A Feat should be PASSIVE of ACTIVE.',
            },
            description: {
                type: String,
                required: 'A Feat should have a description.',
            }
        }],
    },
});

CharacterSchema.index({
    name: 'text'
});

module.exports = mongoose.model('Character', CharacterSchema);