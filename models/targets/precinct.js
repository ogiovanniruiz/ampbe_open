var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PrecinctsSchema = new Schema(
    {
      geometry: {},
      properties: { precinctName: {type: String},
                    precinctID: {type: String},
                    type: {type: String},
                    county: [{name: {type: String}}],
      }
    }
);

//Export model
module.exports = mongoose.model('Precincts', PrecinctsSchema);
