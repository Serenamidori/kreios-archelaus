const { Schema, model } = require('mongoose');

const User = Schema({
    discordId: String,
    personalityPref: String
});

module.exports = model('User', User);