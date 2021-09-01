var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NonresponseContact = require('../nonResponse')
var ScriptResponseContact = require('../scriptResponse')
var Person = require('../../people/people')
var Name = require('../../people/name')

var IncomingCallSchema = new Schema({
    personID: {type: String},
    activityID: {type: String},
    orgID: {type: String},
    campaignID: {type: Number},
    userID: {type: String},
    orgName: {type: String},
    userName: Name.schema,
    callInitTime: {type: Date, default: Date.now}, 
    lengthOfCall: {type: Number, default: 0},
    status: {type: String, enum: ['failed', 'completed', 'no-answer'], default: undefined},
    CallSid: {type: String},           
    residentPhonenum: {type: String},
    userPhonenum: {type: String},   
    person: Person.schema,
    member: {type: Boolean, default: false},
}
);

//Export model
module.exports = mongoose.model('IncomingCall', IncomingCallSchema);