var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../people/name')

var HotlineCallSchema = new Schema(
  {
    orgID: {type: String},
    callSid: {type: String},
    hotline_phonenumber: {type: String},
    remote_phonenumber: {type: String},
    remote_name: Name.schema,
    dispatcher_phonenumber: {type: String},
    dispatcher_name: Name.schema,
    dispacther_userID: {type: String},
    date_created: {type: Date, default: Date.now},
    direction: {type: String},
    call_status: {type: String},
    notes: {type: String},

  }
);

//Export model
module.exports = mongoose.model('HotlineCall', HotlineCallSchema);