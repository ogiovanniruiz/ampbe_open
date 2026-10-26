var mongoose = require('mongoose');
const estimateResults = require('./estimateResults');
var Schema = mongoose.Schema;

var GroupSchema = new Schema(
  {
    name: {type: String}, 
    orgID: {type: String},
    campaignID: {type: Number},
    groupBy: {type: String, enum: [ "HOUSEHOLD", "INDIVIDUAL" , "MEMBERSHIP"]},
    queries:{},
    campaignWide: {type: Boolean, default: false},
    includesPolygon: {type: Boolean, default: false},
    includesSurvey: {type: Boolean, default: false},
    active: {type: Boolean, default: true},
    estimateResults: estimateResults.schema
  }
);

//Export model
module.exports = mongoose.model('Group', GroupSchema);