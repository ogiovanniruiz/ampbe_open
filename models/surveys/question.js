var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Response = require('./response.js')

var QuestionSchema = new Schema(
  {
    question: {type: String},
    responses: [Response.schema],
    questionType: {type: String, enum: ["SINGLESELECT", "MULTISELECT", "NOTES", "EMAIL", "PHONENUMBER"]},
    active: {type: Boolean, default: true},
    orgIDs: [{type: String}],
  }
);

//Export model
module.exports = mongoose.model('Question', QuestionSchema);