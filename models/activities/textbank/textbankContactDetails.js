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
       imageUrl: {type: String},
       // Saved but not sent: another person in this textbank already has this phone number
       duplicateNumber: {type: Boolean},
       // Initial text delivery, kept current by SignalWire status callbacks
       messageSid: {type: String},
       deliveryStatus: {type: String},
       deliveryError: {type: String}
    }
  );
  
  //Export model
  module.exports = mongoose.model('TextbankContactDetails', TextbankContactDetailsSchema);