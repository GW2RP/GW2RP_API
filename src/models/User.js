const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'validation', 'banned'],
        default: 'validation'
    },
    register_date: {
        type: Date,
        default: new Date()
    },
    last_connect: {
        type: Date,
        default: new Date()
    },
    gw2_account: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    validation_token: {
        type: String,
    },
    subscriptions: {
        email: {
            expirations: {
                type: Boolean,
                default: false,
            },
        },
    },
});

UserSchema.index({ username: 'text' }, { unique: true });

module.exports = mongoose.model('User', UserSchema);