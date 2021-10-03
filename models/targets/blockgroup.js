var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockGroupsSchema = new Schema(
    {
      geometry: {},
      properties: { geoid: String,
                    type: {type: String},
                    county: [{name: {type: String}, code: {type: String}}],
                    demographics: {totalPop: {type: Number}, 
                                   percentMale: {type: Number}, 
                                   percentFemale: {type: Number}, 

                                   percentWhite: {type: Number},
                                   percentBlack: {type: Number},
                                   percentIndig: {type: Number}, 
                                   percentOther: {type: Number}, 
                                   percentHispanic: {type: Number},
                                   percentAsian: {type: Number},
                                   percentPI: {type: Number},
                                   avgHHIncome: {type: Number}
                                   
                                  }  
      }
    }
);

//Export model
module.exports = mongoose.model('BlockGroups', BlockGroupsSchema);
