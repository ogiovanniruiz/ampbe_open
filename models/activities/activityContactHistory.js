var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NonresponseContact = require('../nonResponse')
var ScriptResponseContact = require('../scriptResponse')
var Person = require('../../people/people')
var Name = require('../../people/name')


var ActivityContactHistorySchema = new Schema(
    {
       personID: {type: String},
       activityID: {type: String},
       orgID: {type: String},
       orgName: {type: String},
       campaignID: {type: Number},
       userID: {type: String},
       userName: Name.schema,
       textInitDate: {type: Date, default: Date.now},
       textSuccessful: {type: Boolean, default: false},
       textReceived: {status: {type: Boolean, default: false}, date: {type: Date, default: undefined}},
       residentPhonenum: {type: String},
       userPhonenum: {type: String},
       textConvo: [{origin: {type: String}, msg: {type: String}, error: {type: String, default: 'false'}, date: {type: Date, default: Date.now}}],
       nonResponse: {type: NonresponseContact.schema, default: undefined}, 
       scriptResponse: {type: ScriptResponseContact.schema, default: undefined},
       person: Person.schema,
       pass: {type: Number},
       complete: {type: Boolean, default: false},
       member: {type: Boolean, default: false},
    }
  );
  
  //Export model
  module.exports = mongoose.model('ActivityContactHistory', ActivityContactHistorySchema);