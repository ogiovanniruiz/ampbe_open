var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChargesSchema = new Schema(
  {
    orgID: {type: String},
    chargeID: {type: String},
    ammountInPence: {type: Number},
    captured: {type: Boolean, default: false},
    refunded: {type: Boolean, default: false}
  }
);

//Export model
module.exports = mongoose.model('Charges', ChargesSchema);