var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockGroupsSchema = new Schema(
    {
      geometry: {},
      properties: { geoid: {type: String},
                    county: {type: String},
                    htcData: {},
                    demographics: {totalPop: {type: Number}, 
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
