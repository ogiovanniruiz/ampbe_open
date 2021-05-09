var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../people/name')
var ScriptResponse = require('../activities/scriptResponse')
var NonResponse = require('../activities/nonResponse')
var Person = require('../people/people')
var User = require('../users/user')

var OutreachReportSchema = new Schema(
  {
    personID: {type: String},
    residentPhonenum: {type: String},
    userID: {type: String},
    orgID:  {type: String},
    campaignID: {type: Number},
    scriptID: {type: String},
    activityID: {type: String},
    activityType: {type: String},
    scriptResponse: ScriptResponse.schema,
    nonResponse: NonResponse.schema,
    date: {type: Date, default: Date.now},
    person: Person.schema,
    user: User.schema,
    member: {type: Boolean, default: false}
  }
);

//Export model
module.exports = mongoose.model('OutreachReport', OutreachReportSchema);
