const { Schema, model } = require('mongoose');

const Player = Schema({
    username: String,
    userId: String,
    campaignId: String,
    leader: Boolean,
    characters: String,
    notes: String
});

module.exports = model('Player', Player);