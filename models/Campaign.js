const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campaignSchema = new Schema({
    channelId: String,
    interventionPoints: Number
});

module.exports = mongoose.model('Campaign', campaignSchema);