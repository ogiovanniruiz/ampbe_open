var mongoose = require('mongoose');
var TextMetaData = require('./textbank/textMetaData')
var PetitionMetadata = require('./petitionMetadata');
var Schema = mongoose.Schema;

var ActivitySchema = new Schema(
  {
    name: {type: String},
    activityType: {type: String, enum: ['Phonebank', 'Canvass', 'Texting', "Petition"]},
    description: {type: String},
    active: {type: Boolean, default: true},
    groupID: {type: String},
    campaignID: {type: Number},
    orgIDs: [{type: String}],
    userIDs: [{type: String}],
    nonResponseSetID: {type: String},
    surveyID: {type: String},
    textMetaData: TextMetaData.schema, 
    enableTexting: {type: Boolean, default: false},
    // Volunteers can open the opt-in form (texts/email sign-up) from this activity
    optinOption: {type: Boolean, default: false},
    passes: {type: Number, default: 0},
    idBy: {type: String, enum :[ "HOUSEHOLD", "INDIVIDUAL"]},
    hhReady: {type: Boolean, default: false},
    scriptLink: {type: String},
    patchThroughNumber: {type: String},
    updated: {type: Boolean, default: false},//????
    petitionMetadata: PetitionMetadata.schema,
    notes: {type: String},
    completed: {type: Boolean, default: false},
    questionsToHide: [{type: String}],
    // Tag names (exact spelling) not offered in this activity's tag pickers
    tagsToHide: [{type: String}]
  }
);

//Export model
module.exports = mongoose.model('Activity', ActivitySchema);
