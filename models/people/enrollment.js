var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// How a person joined the org's member list and what they agreed to.
// dateUpdated is set when that consent changes (no default, so one consent never stamps the other).
var EnrollmentSchema = new Schema(
  {
    optinEmail: {status:{type: Boolean, default: false}, dateUpdated: {type: Date}},
    optinTexting: {status:{type: Boolean, default: false}, dateUpdated: {type: Date}},
    sourceID: {type: String}, //activityID, uploadID or userID
    orgID: {type: String},
    source: {type: String, enum: ['Texting', 'Canvassing', 'Phonebanking',  "Petition", 'Upload', "Manual"]},
    createdBy: {type: String},
    dateCreated: {type: Date}, // set explicitly when the member is created (no default: consent alone mustn't stamp it)
  }
);

// Embedded in Membership only, so just the schema
module.exports = {schema: EnrollmentSchema};
