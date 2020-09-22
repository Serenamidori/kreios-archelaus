const { Schema, model } = require('mongoose');

const User = Schema({
    id: String,
    username: String,
    nickname: String,
    personalityPref: String
});

module.exports - model('User', User);