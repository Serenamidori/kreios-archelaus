const { Schema, model } = require('mongoose');

const Campaign = Schema({
    id: Number,
    channelId: String,
    voiceChannelId: String,
    name: String,
    description: String,
    interventionPoints: Number,
    active: Boolean
});

module.exports = model('Campaign', Campaign);