var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrganizationSchema = new Schema(
  {
    name: {type: String},
    userIDs: [{type: String}],
    campaignIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    twilioAccount: {sid: {type: String}, authToken: {type: String}, app_sid: {type:String}},
    dismissedDuplicates: [{type: String}], // duplicate group signatures marked "not duplicates"
    // The org's one tag list. A plain tag has no values and no color; others have values with colors
    // (e.g. "Immigrant Justice" 1-5) or a single color.
    tagDefinitions: [{
      label: {type: String},
      valueType: {type: String, enum: ['none', 'range', 'list'], default: 'none'},
      range: {min: {type: Number}, max: {type: Number}}, // valueType 'range'
      values: [{value: {type: String}, color: {type: String}, _id: false}], // every number of the range, or the words
      color: {type: String}, // valueType 'none'
      createdBy: {type: String},
      dateCreated: {type: Date},
    }],
    requests: [{type: String}],
    subscription: {type: String, enum: ["FREE", "LITE", "CORE", "PLUS"], default: "FREE"},
    termsAgreement: {type: Boolean, default: false},
    orgAgreements: [{version: String, userID: String, date: {type: Date, default: Date.now}}],
    signalWireAccount: {brandID: {type: String}, accountID: {type: String}},
    contactEmail: {type: String},
    mailerLiteAPIKey: {type: String},
    callingService: {type: String, enum: ['twilio', 'signalwire'], default: "signalwire"}
  }
);

//Export model
module.exports = mongoose.model('Organization', OrganizationSchema);