var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RRCallSchema = new Schema(
  {
    name: {type: String}, 
    orgID: {type: String},
  }
);

//Export model
module.exports = mongoose.model('RRCall', RRCallSchema);