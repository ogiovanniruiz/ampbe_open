var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockSchema = new Schema(
    {
      geometry: {},
      properties: { geoid: {type: String},
                    demographics: {totalPop: {type: Number}, 
                                   cvap: {type: Number},
                                   lcvap: {type: Number},
                                   acvap: {type: Number},
                                   bcvap: {type: Number},
                                  }  
      }
    }
);

//Export model
module.exports = mongoose.model('Block', BlockSchema);
