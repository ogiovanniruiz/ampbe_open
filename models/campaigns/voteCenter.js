var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// GeoJSON Point features, one per voting site. Sites sharing a point (e.g. a City Hall
// and its outdoor drop box) are separate docs. The geocoder also adds a lowercase
// `county` that is wrong for San Bernardino sites, so only `County` is modeled.
var VoteCenterSchema = new Schema({
  type: {type: String, default: 'Feature'},
  properties: {
    Name: {type: String},
    Address: {type: String},
    Street: {type: String},
    City: {type: String},
    State: {type: String},
    Zip: {type: String},
    Hours: {type: String},
    'Location Type': {type: String},
    County: {type: String},
    Election: {type: String},
    formatted_address: {type: String},
    accuracy: {type: Number},
    accuracy_type: {type: String},
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
},
  { collection : 'vote_centers' }
);

//Export model
module.exports = mongoose.model('VoteCenter', VoteCenterSchema);
