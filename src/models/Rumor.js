const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RumorSchema = new Schema({
    title: {
        type: String,
        require: 'A rumour shall have a title.'
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
        required: 'A rumour shall have an owner.'
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
        required: 'Location shall have coordinates.'
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
    }
});

module.exports = mongoose.model('Rumor', RumorSchema);