var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../../people/name');
var ScriptResponseContact = require('../scriptResponse')

var PetitionContactHistorySchema = new Schema({
    name: Name.schema, // Keep this?,
    personID: {type: String},
    orgID: {type: String},
    campaignID: {type: String},
    personID: {type: String},
    activityID: {type: String},
    userID: {type: String},
    userName: Name.schema,
    residentPhonenum: {type: String},
    dateCreated: {type: Date, default: Date.now},
    email: {type: String, lowercase: true},
    address: {  
        address: {type: String, uppercase: true},
        city: {type: String, uppercase: true},
        state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
        zip: {type: String},},
    location: {type: { type: String },
        coordinates: { type: [Number] }},
    scriptResponse: {type: ScriptResponseContact.schema, default: undefined},
});

//Export model
module.exports = mongoose.model('PetitionContactHistory', PetitionContactHistorySchema);
