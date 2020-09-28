const { Schema, model } = require('mongoose');

const Session = Schema({
    id: Number,
    channelId: String
});

module.exports = model('Session', Session);