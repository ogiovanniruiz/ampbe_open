var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HHDistricts = require('../households/hhDistricts');
var Resident = require('./resident');
const Enrollment = require('./enrollment');

var MembershipSchema = new Schema(
  {
    resident: Resident.schema,
    address: {
      streetNum: {type: String},
      prefix: {type: String, uppercase: true},
      street: {type: String, uppercase: true},
      suffix: {type: String, uppercase: true},
      unit: {type: String, uppercase: true},
      city: {type: String, uppercase: true},
      state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
      zip: {type: String},
    },
    fullAddress1: {type: String, uppercase: true},
    fullAddress2: {type: String, uppercase: true},
    accuracyType: {type: String},
    location: {type: { type: String },
               coordinates: { type: [Number] }},
    county: {type: String},
    districts: HHDistricts.schema,
    registrationPrecinctID: {type: String, default: ''},
    enrollment: Enrollment.schema,
    // No defaults: a missing value reads as false, and saves don't stamp false over data the backfill will copy
    isRegisteredVoter: {type: Boolean},
    geocoded: {type: Boolean},
    // One entry per label; value is one of the label's tagDefinitions values (empty for plain tags).
    // Colors aren't stored here: they come from the org's tagDefinitions.
    tags: [{label: {type: String}, value: {type: String}, _id: false}],
    activityIDs: [{type: String}], // every activity that added or opted in this member
    mergedPersonIDs: [{type: String}], // personIDs of members merged into this one, so their contact history follows

  }
);

MembershipSchema.index({'enrollment.orgID': 1, 'enrollment.dateCreated': -1})
MembershipSchema.index({'enrollment.orgID': 1, 'tags.label': 1})
MembershipSchema.index({'enrollment.orgID': 1, activityIDs: 1})
MembershipSchema.index({'enrollment.orgID': 1, 'enrollment.source': 1, 'enrollment.sourceID': 1})
// Finding the org's member for a person (opt-in sheet, consent updates, canvass member check)
MembershipSchema.index({'enrollment.orgID': 1, 'resident.personID': 1})

//Export model
module.exports = mongoose.model('Memberships', MembershipSchema);
