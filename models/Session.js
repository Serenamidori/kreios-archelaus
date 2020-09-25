const { Schema, model } = require('mongoose');

const Session = Schema({
    id: String,
    discordChannel: String,
    discordVC: String,
    nickname: String,
    description: String,
    interventionPoints: Number
});

module.exports = model('Session', Session);