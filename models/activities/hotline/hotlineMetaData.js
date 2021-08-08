var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HotlineMetaDataSchema = new Schema({
    mainPhoneNumber: {type: String},
    email: {type: String},
    voiceMailNumber: {type: String}
  }
);

//Export model
module.exports = mongoose.model('HotlineMetaData', HotlineMetaDataSchema);
