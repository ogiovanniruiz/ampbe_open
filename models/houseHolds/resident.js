var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Name = require('../people/name')
var Phone = require('../people/phone')
var CreationInfo = require('./creationInfo.js')

var ResidentSchema = new Schema(
  {
    _id: {type: String},
    personID: {type: String},
    name: Name.schema,
    userID: {type: String},
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
    doNotContact: {type: Boolean},
  }
);

//Export model
module.exports = mongoose.model('Resident', ResidentSchema);
