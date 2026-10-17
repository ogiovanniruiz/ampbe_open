var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = require('./question'); 

var SurveySchema = new Schema(
  {
    name: {type: String},
    userID: {type: String},
    questions: [Question.schema],
    dateCreated: {type: Date, default: Date.now},
    campaignIDs: [{type: Number}],
    orgID: {type: String},
    active: {type: Boolean, default: true},
    optinOption: {type: Boolean, default: false}
  }
);

//Export model
module.exports = mongoose.model('Survey', SurveySchema);