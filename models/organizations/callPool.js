var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallPoolSchema = new Schema(
  {
    orgID: {type: String},
    number: {type: String}, 
    available: {type: Boolean, default: true},
    dateUpdated: {type: Date, default: Date.now},
    purchaseDate: {type: Date, default: Date.now},
    numCalls: {type: Number, default: 0}
  }
);

//Export model
module.exports = mongoose.model('CallPool', CallPoolSchema);