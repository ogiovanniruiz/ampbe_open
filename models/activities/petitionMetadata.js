var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PetitionMetadataSchema = new Schema({
  checkVoterfile: { type: Boolean, default: false },
  requireFullAddress: { type: Boolean, default: false },
  requireEmail: { type: Boolean, default: false },
  // No defaults: older petitions leave these unset and are read from requireFullAddress / requireEmail
  includeAddress: { type: Boolean },
  requireAddress: { type: Boolean },
  includeEmail: { type: Boolean },
});

//Export model
module.exports = mongoose.model('PetitionMetadata', PetitionMetadataSchema);
