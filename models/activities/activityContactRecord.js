var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Nonresponse = require('./nonResponse')
var SurveyResponse = require('./surveyResponse')
var Person = require('../people/people')
var User = require('../users/user')
var TextbankContactDetails = require('./textbank/textbankContactDetails')
var PhonebankContactDetails = require('./phonebank/phonebankContactDetails')

var ActivityContactRecordSchema = new Schema(
    {
       personID: {type: String},
       person: Person.schema,

       userID: {type: String},
       user: User.schema,

       activityID: {type: String},
       orgID: {type: String},
       campaignID: {type: Number},

       creationDate: {type: Date, default: Date.now},
       activityType: {type: String, enum: ['Phonebank', 'Canvass', 'Texting', 'Petition']},
       
       textbankContactDetails: {type: TextbankContactDetails.schema, default: undefined},
       phonebankContactDetails: {type: PhonebankContactDetails.schema, default: undefined},

       nonResponse: {type: Nonresponse.schema, default: undefined}, 
       surveyResponse: {type: SurveyResponse.schema, default: undefined},
       
       pass: {type: Number, default: 0},
       complete: {type: Boolean, default: false},
       member: {type: Boolean, default: false},

       activityHouseholdRecordID: {type: String},

       // Corrections made from the activity report; "before" is the response as it was
       editHistory: {type: [{editorID: String, editorName: String, date: Date, before: Schema.Types.Mixed}], default: undefined}
    }
  );

  ActivityContactRecordSchema.index({campaignID: 1, 'surveyResponse.surveyID': 1})
  ActivityContactRecordSchema.index({activityID: 1})
  ActivityContactRecordSchema.index({'nonResponse.nonResponseType': 1, orgID: 1, campaignID: 1})

  // One canvass survey response per person per activity, even when two submits race.
  // Built by scripts/cleanupDuplicateCanvassResponses.js --build-index once older duplicates are removed.
  ActivityContactRecordSchema.index({activityID: 1, personID: 1}, {
    unique: true,
    name: 'canvass_one_survey_per_person',
    partialFilterExpression: {activityType: 'Canvass', surveyResponse: {$exists: true}, personID: {$type: 'string'}}
  })

  //Export model
  module.exports = mongoose.model('ActivityContactRecord', ActivityContactRecordSchema);