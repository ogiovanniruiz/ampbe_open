var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NonResponse = require('./nonResponse'); 

var NonResponseSetSchema = new Schema(
  {
    title: {type: String},
    createdBy: {type: String},
    nonResponses: [NonResponse.schema],
    dateCreated: {type: Date, default: Date.now},
    campaignIDs: [{type: Number}],
    orgStatus: {orgID: {type: String}, active: {type: Boolean, default: true}},
  }
);

//Export model
module.exports = mongoose.model('NonResponseSet', NonResponseSetSchema);