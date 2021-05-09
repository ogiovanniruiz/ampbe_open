var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var PhoneSchema = new Schema(
  {
    type: {type: String},
    number: {type: String},
    //textable: {type: String, default: '?', enum: ['?', 'TRUE','FALSE']}
  }
);


//Export model
module.exports = mongoose.model('Phone', PhoneSchema);