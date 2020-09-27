const { Schema, model } = require('mongoose');

const Info = Schema({
    campaignCount: Number,
    serverId: String
});

module.exports = model('Info', Info);