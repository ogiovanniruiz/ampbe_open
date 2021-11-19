var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NonResponseSchema = new Schema(
  { 
    nonResponseType: {type: String, enum: ["IMP", "INVALIDPHONE", "DNC","NONRESPONSE", "INVALIDADDRESS"]},
    nonResponse: {type: String},
  }
);

//Export model
module.exports = mongoose.model('NonResponse', NonResponseSchema);
