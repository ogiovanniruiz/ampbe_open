var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NonresponseContact = require('../nonResponse')
var ScriptResponseContact = require('../scriptResponse')
var Person = require('../../people/people')
var Name = require('../../people/name')

var CanvassContactHistorySchema = new Schema({
    personID: {type: String},
    activityID: {type: String},
    orgID: {type: String},
    campaignID: {type: Number},
    userID: {type: String},
    userName: Name.schema,
    nonResponse: {type: NonresponseContact.schema, default: undefined},
    scriptResponse: {type: ScriptResponseContact.schema, default: undefined},    
    pass: {type: Number},
    person: Person.schema,
    complete: {type: Boolean, default: false},
    member: {type: Boolean, default: false},
    date: {type: Date, default: Date.now}, 
}
);

//Export model
module.exports = mongoose.model('CanvassContactHistory', CanvassContactHistorySchema);