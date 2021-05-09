var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../../models/people/name');
var Phone = require('../people/phone');
var HHDistricts = require('../houseHolds/hhDistricts');

var MembershipSchema = new Schema(
  {
    resident: {
      personID: {type: String},
      orgID: {type: String},
      uploadID: {type: String},
      tags: [{type: String}], 
      name: Name.schema,
      phones: [Phone.schema],
      email: {type: String, lowercase: true},
      issues: [{type: String}],
      dob: {type: Date},
      userID: {type: String},
      affidavit: {type: String},
      method: {type: String, enum: ['UPLOAD', 'MANUAL']},
      fileName: {type: String},
      voter: {type: Boolean, default: false},
      ethnicity: {type: String, uppercase: true}
    },
    address:{
      address: {type: String, uppercase: true},
      city: {type: String, uppercase: true},
      state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
      zip: {type: String},
    },
    fullAddress1: {type: String, uppercase: true},
    fullAddress2: {type: String, uppercase: true},
    accuracyType: {type: String},
    location: {type: { type: String },
                       coordinates: { type: [Number] }},
    geocoded: {type: Boolean, default: false},
    blockgroupID: {type: String},
    districts: HHDistricts.schema,
    precinctID: {type: String},
    date: {type: Date, default: Date.now}
  }
);

//Export model
module.exports = mongoose.model('Membership', MembershipSchema);
