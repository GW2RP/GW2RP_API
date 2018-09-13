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
    difficulty: {
        type: String,
        enum: ['peaceful', 'easy', 'normal', 'difficult', 'hardcore'],
        lowercase: true,
        required: 'An Event should have a difficulty.',
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
    dates: {
        _id: false,
        start: {
            _id: false,
            type: Date,
            required: 'Event should have a start date.',
        },
        end: {
            _id: false,
            type: Date,
            required: 'Event should have an end date.',
        },
        recursivity: {
            type: String,
            enum: ['NONE', '1-WEEK', '2-WEEK', '3-WEEK', '4-WEEK'],
            default: 'NONE',
        }
    },
    participants: [{
        _id: false,
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        participation: {
            type: String,
            enum: ['YES', 'NO', 'MAYBE'],
            uppercase: true,
        }
    }]
});

EventSchema.index({ title: 'text' });

module.exports = mongoose.model('Event', EventSchema);