const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractSchema = new Schema({
    title: {
        type: String,
        required: 'A contract shall have a title.'
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
        required: 'A contract shall have an owner.'
    },
    description: {
        type: String,
        required: 'Contract shall have a description.'
    },
    reward: {
        type: String,
        required: 'A contract should have a reward.'
    },
    site: {
        type: String
    },
    pretenders: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    type: {
        type: String,
        required: 'A Contract shall have a valid type.',
        lowercase: true,
    },
});

ContractSchema.index({ title: 'text' });

module.exports = mongoose.model('Contract', ContractSchema);