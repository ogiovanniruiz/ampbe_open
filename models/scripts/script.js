var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = require('./question'); 

var ScriptSchema = new Schema(
  {
    title: {type: String},
    createdBy: {type: String}, //USER ID
    questions: [Question.schema],
    dateCreated: {type: Date, default: Date.now},
    campaignIDs: [{type: Number}],
    orgStatus: {orgID: {type: String}, active: {type: Boolean, default: true}},
    //participatingOrgs: [{orgID: {type: String}, active: {type: Boolean, default: true}}]
  }
);

//Export model
module.exports = mongoose.model('Script', ScriptSchema);