var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrecinctsSchema = new Schema(
    {
      geometry: {},
      properties: { precinctName: String,
                    precinctID: String,
                    type: {type: String},
                    county: [{name: {type: String}}],
                    registered: [{orgID: {type: String}, campaignID: {type: Number}}],
                    locked: [{orgID: {type: String}, campaignID: {type: Number}, targetID: {type: String}, finished: {type: Boolean, default: false}}]
      }
    }
);

//Export model
module.exports = mongoose.model('Precincts', PrecinctsSchema);
