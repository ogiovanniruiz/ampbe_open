var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EstimateResultsSchema = new Schema(
  {
    totalResidents: {type: Number, default: 0},
    totalHHs: {type: Number, default: 0},
    totalPhones: {type: Number, default: 0},
    totalTextable: {type: Number},
    
  }
);

//Export model
module.exports = mongoose.model('EstimateResults', EstimateResultsSchema);