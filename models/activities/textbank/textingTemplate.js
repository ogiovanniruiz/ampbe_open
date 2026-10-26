var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var InitTextMsgSchema = require('./initTextMsg');

var TextingTemplateSchema = new Schema({
    name: {type: String},
    orgID: {type: String},
    campaignID: {type: Number},
    quickResponses: [{type: String}],
    initTextMsgs: [InitTextMsgSchema],
  }
);

//Export model
module.exports = mongoose.model('TextingTemplate', TextingTemplateSchema);
