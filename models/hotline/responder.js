var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var IncidentAddress = require('./incidentAddress')
var Name = require('../people/name')

var ResponderSchema = new Schema(
  {
    name: Name.schema,
    orgID: {type: String},
    phonenumber: {type: String},
    email:{type: String},
    location: {type: { type: String },
    coordinates: { type: [Number] }},
    address: IncidentAddress.schema,
    audience: [{type: String}]
  }
);

//Export model
module.exports = mongoose.model('Responder', ResponderSchema);