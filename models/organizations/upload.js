var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadSchema = new Schema(
  {
    uploadName: {type: String},
    fileName: {type: String},
    userID: {type: String},
    uploadFinished: {type: Boolean, default: false},
    geocoded: {type: Boolean, default: false},
    geographyFound: {type: Boolean, default: false},
    votersChecked: {type: Boolean, default: false},
    duplicatesChecked: {type: Boolean, default: false},
    orgID: {type: String},
    date: {type: Date, default: Date.now},
    checkVoterfile: { type: Boolean, default: false },
    checkDuplicates: { type: Boolean, default: false },
    // Tag values in the file that the tag doesn't offer; those members got the tag without a value
    tagValueMissCount: {type: Number, default: 0},
    tagValueMisses: [{label: String, value: String, count: Number, _id: false}],
  }
);

//Export model
module.exports = mongoose.model('Upload', UploadSchema);