var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoteHistorySchema = new Schema(
  {
    year: {type: String},
    electionType: {type: String, enum: ['General', 'Primary', 'Special']},
    voted: {type: Boolean},    
  }
);


//Export model
module.exports = mongoose.model('VoteHistory', VoteHistorySchema);