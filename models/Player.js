const { Schema, model } = require('mongoose');

const Player = Schema({
    userId: String,
    campaignId: String,
    leader: Boolean,
    characters: String,
    notes: String
});

module.exports = model('Player', Player);