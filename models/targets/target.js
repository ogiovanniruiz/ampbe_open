var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TargetSchema = new Schema(
  {
    properties: {  name: {type: String}, 
                   orgID: {type: String},
                   campaignID: {type: Number},
                   idByHousehold: {type: String, enum: [ "HOUSEHOLD", "INDIVIDUAL" , "MEMBERSHIP"]},
                   queries:{},
                   targetType: {type: String, enum: [ "POLY", "BLOCKGROUP" , "PRECINCT", "CAMPAIGN"]},//MAY NOT BE NEEDED
                   campaignWide: {type: Boolean, default: false},
                   geometric: {type: Boolean, default: false}
                },
  }
);

//Export model
module.exports = mongoose.model('Target', TargetSchema);
