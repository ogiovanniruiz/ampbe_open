var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TextMetaDataSchema = new Schema({
    quickResponses: [{type: String}],
    initTextMsg: {type: String},
    sendReceiverName: {type: Boolean},
    sendSenderName: {type: Boolean},
    attachImage: {type: Boolean},
    imageUrl: {type: String},
    spanishMode: {type: Boolean, default: false},
    activityPhonenums: [{number: {type: String}, 
                         userID: {type: String}, 
                         userFullName: {type: String}}],
  }
);

//Export model
module.exports = mongoose.model('TextMetaData', TextMetaDataSchema);
