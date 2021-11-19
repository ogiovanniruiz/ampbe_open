var mongoose = require('mongoose');
var TextMetaData = require('./textbank/textMetaData')
var HotlineMetaData = require('./hotline/hotlineMetaData')
var Schema = mongoose.Schema;

var ActivitySchema = new Schema(
  {
    name: {type: String},
    activityType: {type: String, enum: ['Phonebank', 'Canvass', 'Petition', 'Texting', 'Event', 'Hotline']},
    description: {type: String},
    active: {type: Boolean, default: true},
    targetID: {type: String},
    campaignID: {type: Number},
    orgIDs: [{type: String}],
    userIDs: [{type: String}],
    nonResponseSetID: {type: String},
    scriptID: {type: String},
    textMetaData: TextMetaData.schema, 
    passes: {type: Number, default: 0},
    idByHousehold: {type: String, enum :[ "HOUSEHOLD", "INDIVIDUAL" , "MEMBERSHIP"]},
  }
);

//Export model
module.exports = mongoose.model('Activity', ActivitySchema);
