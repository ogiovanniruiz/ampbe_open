var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../../people/name')

var HotlineContactHistorySchema = new Schema({
    activityID: {type: String},
    contactUserID: {type: String},
    residentPhoneNum: {type: String},
    userPhoneNum: {type: String},
    name: Name.schema,
    address: {type: String},
    notes: {type: String},
    orgID: {type: String},
    email: {type: String},
    campaignID: {type: Number},
    blocked: {type: Boolean, default: false},
    date: {type: Date, default: Date.now},
    urgencyLevel: {type: String},
});

//Export model
module.exports = mongoose.model('HotlineContactHistory', HotlineContactHistorySchema);