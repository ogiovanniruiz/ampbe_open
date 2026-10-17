var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionResponseSchema = new Schema({
    question: {type: String}, 
    questionType: {type: String},
    response: {type: String}, 
                        
}
);

//Export model
module.exports = mongoose.model('QuestionResponse', QuestionResponseSchema);
