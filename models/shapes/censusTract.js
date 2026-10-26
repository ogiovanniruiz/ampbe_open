var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CensusTractsSchema = new Schema(
    {
      geometry: {},
      properties: { geoid: {type: String},
                    county: {type: String},
                    hpi_index: {type: Number},
                    environmentalData: {enviroScore: {type: Number}, 
                    diesel: {type: Number},
                    h20: {type: Number},
                    ozone: {type: Number},
                    pm25: {type: Number},
                                  }  
      }
    }
);

//Export model
module.exports = mongoose.model('CensusTracts', CensusTractsSchema);