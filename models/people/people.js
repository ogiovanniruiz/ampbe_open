var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HHDistricts = require('../households/hhDistricts')
var Resident = require('./resident');

var PeopleSchema = new Schema(
  {
    resident: Resident.schema,
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
    county: {type: String},
    districts: HHDistricts.schema,
    registrationPrecinctID: {type: String, default: ''},
    invalidaddress: {type: Boolean, default: false},
    new_reg: {type: Boolean}
  },{ collection : 'people2026b' }
);

//Export model
module.exports = mongoose.model('People', PeopleSchema);
