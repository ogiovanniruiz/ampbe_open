var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IncomingTwilioRecordSchema = new Schema({
    callSid: {type: String},
    parentCallSid: {type: String},
    residentPhoneNum: {type: String},
    userPhoneNum: {type: String}
});

//Export model
module.exports = mongoose.model('IncomingTwilioRecord', IncomingTwilioRecordSchema);