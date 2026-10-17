var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Images attached to outgoing texts. Kept in the database because Heroku's disk is wiped
// on every restart. Served publicly by key so SignalWire can fetch them as mediaUrl.
var TextImageSchema = new Schema({
    key: {type: String, required: true, unique: true},
    orgID: {type: String, required: true},
    data: {type: Buffer, required: true},
    contentType: {type: String},
    size: {type: Number},
    createdAt: {type: Date, default: Date.now},
  },
  { collection : 'textimages' }
);

//Export model
module.exports = mongoose.model('TextImage', TextImageSchema);
