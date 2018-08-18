const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        require: 'An Event shall have a title.'
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
        required: 'An Event shall have an owner.'
    },
    coordinates: {
        _id: false,
        x: {
            _id: false,
            type: Number,
            required: 'Event coordinates shall have x value.'
        },
        y: {
            _id: false,
            type: Number,
            required: 'Event coordinates shall have y value.'
        },
    },
    description: {
        type: String,
        required: 'Event shall have a description.'
    },
    contact: {
        type: String,
        required: 'Event shall have a contact.'
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
    },
    participants: {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        participation: {
            type: String,
            enum: ["YES", "NO", "MAYBE"]
        }
    }
});

EventSchema.index({ title: 'text' });

module.exports = mongoose.model('Event', EventSchema);