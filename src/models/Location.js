const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    title: {
        type: String,
        require: 'An Location shall have a title.'
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
        required: 'An Location shall have an owner.'
    },
    coordinates: {
        _id: false,
        x: {
            _id: false,
            type: Number,
            required: 'Location coordinates shall have x value.'
        },
        y: {
            _id: false,
            type: Number,
            required: 'Location coordinates shall have y value.'
        },
    },
    description: {
        type: String,
        required: 'Location shall have a description.'
    },
    contact: {
        type: String,
        required: 'Location shall have a contact.'
    },
    site: {
        type: String
    },
    types: {
        type: [String],
        default: ['other'],
    },
    icon: {
        type: String,
        default: 'generic'
    },
    opening_hours: {
        type: Schema.Types.Mixed,
        default: {},
    }
});

LocationSchema.index({ title: 'text' });

module.exports = mongoose.model('Location', LocationSchema);