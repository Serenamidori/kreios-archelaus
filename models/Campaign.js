const { Schema, model } = require('mongoose');

const Campaign = Schema({
    channelId: String,
    interventionPoints: Number
});

module.exports = model('Campaign', Campaign);