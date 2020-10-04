const { Schema, model } = require('mongoose');

const User = Schema({
    username: String,
    discordId: String,
    personalityPref: String
});

module.exports = model('User', User);