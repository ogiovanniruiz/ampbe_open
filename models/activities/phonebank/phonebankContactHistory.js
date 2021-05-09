var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NonresponseContact = require('../nonResponse')
var ScriptResponseContact = require('../scriptResponse')
var Person = require('../../people/people')
var Name = require('../../people/name')

var PhonebankContactHistorySchema = new Schema({
    personID: {type: String},
    activityID: {type: String},
    orgID: {type: String},
    campaignID: {type: Number},
    userID: {type: String},
    userName: Name.schema,
    callInitTime: {type: Date, default: Date.now}, 
    lengthOfCall: {type: Number, default: 0},
    status: {type: String, enum: ['failed', 'completed', 'no-answer'], default: undefined},
    CallSid: {type: String},           
    residentPhonenum: {type: String},
    userPhonenum: {type: String},
    nonResponse: {type: NonresponseContact.schema, default: undefined},
    scriptResponse: {type: ScriptResponseContact.schema, default: undefined},    
    person: Person.schema,
    pass: {type: Number},
    complete: {type: Boolean, default: false},
    member: {type: Boolean, default: false},
}
);

//Export model
module.exports = mongoose.model('PhonebankContactHistory', PhonebankContactHistorySchema);