var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScripResponseContactSchema = new Schema({
    date: {type: Date, default: Date.now},
    contactedBy: {type: String},
    questionResponses:[{question: {type: String}, 
                        response: {type: String}, 
                        idType: {type: String}}]  
}
);

//Export model
module.exports = mongoose.model('ScripResponseContact', ScripResponseContactSchema);
