var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockGroupsSchema = new Schema(
    {
      geometry: {},
      properties: { geoid: String,
                    type: {type: String},
                    county: [{name: {type: String}, code: {type: String}}],
                    registered: [{orgID: {type: String}, campaignID: {type: Number}}],
                    locked: [{orgID: {type: String}, campaignID: {type: Number}, targetID: {type: String}, finished: {type: Boolean, default: false}}], 
                    demographics: {totalPop: {type: Number}, 
                                   percentMale: {type: Number}, 
                                   percentFemale: {type: Number}, 
                                   percentWhite: {type: Number},
                                   percentBlack: {type: Number},
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
