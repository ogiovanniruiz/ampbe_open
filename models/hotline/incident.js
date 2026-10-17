var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../users/user');
var IncidentAddress = require('./incidentAddress')

var IncidentSchema = new Schema(
  {
    orgID: {type: String},
    categories: [{type: String}],
    status: {type: String},
    user: User.schema,
    location: {type: { type: String },
              coordinates: { type: [Number] }},
    address: IncidentAddress.schema,
    date_created: {type: Date, default: Date.now},
    severity: {type: String, enum: ["1", "2", "3"]},
    active: {type: Boolean, default: true},
    date_edited: {type: Date, default: Date.now},
    editedBy: {type: String},
    reports: [{ date_created: {type: Date, default: Date.now}, notes: {type: String}, userID: {type: String}, userName: {type: String}}]
  }
);

//Export model
module.exports = mongoose.model('Incident', IncidentSchema);