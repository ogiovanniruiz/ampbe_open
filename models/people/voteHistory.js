var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoteHistorySchema = new Schema(
  {
    personID: {type: String},
    voteDates: [{date: {type: Date}, type: {type: String, enum: ["GENERAL", "PRIMARY"]}}]
  }
);


//Export model
module.exports = mongoose.model('VoteHistory', VoteHistorySchema);