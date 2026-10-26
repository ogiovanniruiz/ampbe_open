var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PolygonSchema = new Schema(
  {
    properties: {  
                  name: {type: String},
                  description: {type: String},
                  campaignID: {type: Number},
                  campaignIDs: [{type: Number}],
                  orgID: {type: String},
                  userID: {type: String},
                  date: {type: Date, default: Date.now},
                  orgName: {type: String},
                  demographics: {
                    total_hh: {type: Number},
                    totalPop: {type: Number}, 
                    cvap: {type: Number}, 
                    lcvap: {type: Number}, 
                    bcvap: {type: Number}, 
                    acvap: {type: Number}
                   },
                  active: {type: Boolean, default: true},  
                },
    type: {type: String, default: "Feature"},
    geometry: {},
  }
);

//Export model
module.exports = mongoose.model('Polygon', PolygonSchema);
