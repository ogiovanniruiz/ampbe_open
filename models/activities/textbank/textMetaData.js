var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var InitTextMsgSchema = require('./initTextMsg');

var TextMetaDataSchema = new Schema({
    quickResponses: [{type: String}],
    initTextMsgs: [InitTextMsgSchema],
    defaultInitTextMsg: {type: InitTextMsgSchema},
    spanishMode: {type: Boolean, default: false},
    textingCampaignID: {type: String},
    activityPhonenumber: {type: String},
  }
);

//Export model
module.exports = mongoose.model('TextMetaData', TextMetaDataSchema);
