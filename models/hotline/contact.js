var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var IncidentAddress = require('./incidentAddress')
var Name = require('../people/name')

var ContactSchema = new Schema(
  {
    name: Name.schema,
    orgID: {type: String},
    phonenumber: {type: String},
    email:{type: String},
    location: {type: { type: String },
    coordinates: { type: [Number] }},
    address: IncidentAddress.schema,
    audience: [{type: String}],
    blocked: {type: Boolean, default: false}
  }
);

//Export model
module.exports = mongoose.model('Contact', ContactSchema);