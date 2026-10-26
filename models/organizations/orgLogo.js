var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Uploaded org logos. Kept in the database because the host's disk may be wiped on every
// restart; kept out of the Organization doc so org fetches don't carry the image.
var OrgLogoSchema = new Schema({
    orgID: {type: String, required: true, unique: true},
    data: {type: Buffer, required: true},
    contentType: {type: String},
    updatedAt: {type: Date, default: Date.now},
  },
  { collection : 'orglogos' }
);

//Export model
module.exports = mongoose.model('OrgLogo', OrgLogoSchema);
