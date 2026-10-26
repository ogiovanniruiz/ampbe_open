var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PhonebankContactDetailsSchema = new Schema(
    {
       residentPhonenumber: {type: String},
       userPhonenumber: {type: String},
       lengthOfCall: {type: Number, default: 0},
       status: {type: String, enum: ['failed', 'completed', 'no-answer'], default: undefined},
       CallSid: {type: String},  
       // Made by the phonebank page for each call: a call that fails before ringing never gives the page its CallSid
       attemptID: {type: String},
    }
  );
  
  //Export model
  module.exports = mongoose.model('PhonebankContactDetails', PhonebankContactDetailsSchema);