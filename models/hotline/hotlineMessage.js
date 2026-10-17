var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../people/name')

var HotlineMessageSchema = new Schema(
  {
    orgID: {type: String},
    internalPhonenumber: {type: String},
    externalPhonenumber: {type: String},
    textConversation: [{origin: {type: String}, msg: {type: String}, date: {type: Date, default: Date.now}, error: {type: String}, mediaUrl: {type: String}, mediaUrlType: {type: String} }],
    date_created: {type: Date, default: Date.now},
    name: Name.schema,
  }
);

//Export model
module.exports = mongoose.model('HotlineMessage', HotlineMessageSchema);