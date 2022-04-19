var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HHDistricts = require('../houseHolds/hhDistricts')
var Name = require('./name')
var Phone = require('./phone')
var CreationInfo = require('../houseHolds/creationInfo')


var PeopleSchema = new Schema(
  {
    resident: {
      personID: {type: String},
      name: Name.schema,
      phones: [Phone.schema],
      emails: [{type: String}],
      pav: {type: Boolean},
      dob: {type: Date},
      ethnicity: {type: String, uppercase: true},
      party: {type: String},
      affidavit: {type: String},
      voterID: {type: String},
      regDates: [{type: Date}],
      generalPropensity: {type: Number},
      primaryPropensity: {type: Number},
      creationInfo: CreationInfo.schema,
    },

    address:{
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
    county: {code: {type: String}, name: {type: String}},
    blockgroupID: {type: String},
    districts: HHDistricts.schema,
    precinctID: {type: String},
    //primary_zip: {type: String}
  },{ collection : 'people2022' }
);

//Export model
module.exports = mongoose.model('People', PeopleSchema);
