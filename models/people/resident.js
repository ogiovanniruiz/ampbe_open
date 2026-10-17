var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Name = require('./name')
var Phone = require('./phone')
var VoteHistory = require('./voteHistory')

var ResidentSchema = new Schema(
  {
    _id: {type: String},
    personID: {type: String},
    name: Name.schema,
    phones: [Phone.schema],
    emails: [{type: String}],
    pav: {type: Boolean},
    ethnicity: {type: String, enum: ['white', 'hispanic', 'black', 'api', 'native', 'other', 'multiple']},
    gender: {type: String, enum:['male', 'female', 'nonbinary', 'unknown']},
    party: {type: String, enum:['DEM', 'REP', 'NPP', 'MPL', 'MPC', 'OTH']},
    voterID: {type: String},
    ampID: {type: String},
    dob: {type: Date},
    regDates: [{type: Date}],
    generalPropensity: {type: Number},
    primaryPropensity: {type: Number},
    specialPropensity: {type: Number},
    voteHistory: [VoteHistory.schema],
    voted_current_cycle: {type: Boolean, default: false},
    pdi_number: {type: Boolean, default: false},
    invalidnumber: {type: Boolean, default: false},
    pdiID: {type: String},
    sosID: {type: String},
    progressive: {type: Boolean, default: false},
    ideology_score: {type: Number},
    segment: {type: String},
    spanish_probable: {type: Boolean}
  }
);

//Export model
module.exports = mongoose.model('Resident', ResidentSchema);
