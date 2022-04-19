var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PolySchema = new Schema(
  {
    properties: {  
                  name: {type: String},
                  description: {type: String},
                  campaignID: {type: Number},
                  orgID: {type: String},
                  userID: {type: String},
                  date: {type: Date, default: Date.now},
                  demographics: {
                    total_hh: {type: Number},
                    totalPop: {type: Number}, 
                    percentIndig: {type: Number}, 
                    percentWhite: {type: Number},
                    percentOther: {type: Number},
                    percentBlack: {type: Number},
                    percentHispanic: {type: Number},
                    percentAsian: {type: Number},
                    percentPI: {type: Number},
                   }  
                  
                },
    type: {type: String, default: "Feature"},
    geometry: {},
  }
);

//Export model
module.exports = mongoose.model('Poly', PolySchema);
