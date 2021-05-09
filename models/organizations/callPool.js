var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallPoolSchema = new Schema(
  {
    orgID: {type: String},
    number: {type: String}, 
    available: {type: Boolean, default: true},
    hotlineUse: {type: Boolean, default: false},
    dateUpdated: {type: Date, default: Date.now}
  }
);

//Export model
module.exports = mongoose.model('CallPool', CallPoolSchema);