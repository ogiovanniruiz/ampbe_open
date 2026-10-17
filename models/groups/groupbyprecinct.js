var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupByPrecinctSchema = new Schema(
  {
    _id: {type: String},
    groupedHHs: {type: Number},
    groupedResidents: {type: Number},
    hispanicResidents: {type: Number},
    democraticResidents: {type: Number},
    groupID: {type: String}
  },
  { collection : 'groupbyprecinct' }
);

//Export model
module.exports = mongoose.model('groupbyprecinct', GroupByPrecinctSchema);