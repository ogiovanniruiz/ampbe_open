var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var QuestionResponse = require('./questionResponse');

var SurveyResponseSchema = new Schema({
    surveyID: {type: String},
    questionResponses: [QuestionResponse.schema]  
}
);

//Export model
module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
