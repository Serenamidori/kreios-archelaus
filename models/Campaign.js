const { Schema, model } = require('mongoose');
const User = require('./User');

const Campaign = Schema({
    id: Number,
    channelId: String,
    voiceChannelId: String,
    name: String,
    description: String,
    interventionPoints: Number,
    active: Boolean,
    notes: {
        author: String,
        date: String,
        note: String
    }
});

module.exports = model('Campaign', Campaign);