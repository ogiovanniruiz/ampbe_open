var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PolySchema = new Schema(
  {
    properties: {  
                  name: {type: String},
                  campaignID: {type: Number},
                  orgID: {type: String},
                  userID: {type: String},
                },
    type: {type: String, default: "Feature"},
    geometry: {},
  }
);

//Export model
module.exports = mongoose.model('Poly', PolySchema);
