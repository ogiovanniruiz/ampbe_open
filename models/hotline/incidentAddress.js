var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IncidentAddressSchema = new Schema(
  {
    address: {type: String}, 
    address2: {type: String},
    city: {type: String}, 
    state: {type: String},
    zip: {type: String}, 
    county: {type: String},
  }
);

//Export model
module.exports = mongoose.model('IncidentAddress', IncidentAddressSchema);