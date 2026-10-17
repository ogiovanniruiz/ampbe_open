var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InitTextMsgSchema = new Schema({
    msg: {type: String},
    sendReceiverName: {type: Boolean},
    sendSenderName: {type: Boolean},
    attachImage: {type: Boolean, default: false},
    imageUrl: {type: String}
  }, {_id: false}
);

module.exports = InitTextMsgSchema;
