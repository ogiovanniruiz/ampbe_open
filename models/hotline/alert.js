var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlertSchema = new Schema(
  {
    orgID: {type: String},
    incidentID: {type: String},
    date_created: {type: Date, default: Date.now},
    createdBy: {type: String},
    respondersContacted: [{type: String}],
    textMessage: {type: String},
    audiences: [{type: String}],
    coordinates: {type: [Number]},
    radius: {type: Number}  
  }
);

//Export model
module.exports = mongoose.model('Alert', AlertSchema);