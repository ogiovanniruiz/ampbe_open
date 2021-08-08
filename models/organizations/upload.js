var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema(
  {
    fileName: {type: String},
    userID: {type: String},
    uploadFinished: {type: Boolean, default: false},
    geocoded: {type: Boolean, default: false},
    geographyFound: {type: Boolean, default: false},
    orgID: {type: String},
    date: {type: Date, default: Date.now}
  }
);

//Export model
module.exports = mongoose.model('Upload', UploadSchema);