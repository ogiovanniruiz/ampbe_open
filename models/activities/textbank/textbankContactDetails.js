var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TextConversation = require('./textConversation');

var TextbankContactDetailsSchema = new Schema(
    {
       residentPhonenumber: {type: String},
       userPhonenumber: {type: String},
       textSuccessful: {type: Boolean, default: false},
       textReceived: {status: {type: Boolean, default: false}, date: {type: Date, default: undefined}},
       textConvo: [TextConversation.schema],
       initTextMessage: {type: String},
       imageUrl: {type: String}
    }
  );
  
  //Export model
  module.exports = mongoose.model('TextbankContactDetails', TextbankContactDetailsSchema);