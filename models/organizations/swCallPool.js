var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SWCallPoolSchema = new Schema(
  {
    orgID: {type: String},
    number: {type: String}, 
    available: {type: Boolean, default: true},
    dateUpdated: {type: Date, default: Date.now},
    hotline_enabled: {type: Boolean, default: false},
    purchaseDate: {type: Date, default: Date.now},
    numCalls: {type: Number, default: 0}
  }
);

//Export model
module.exports = mongoose.model('SWCallPool', SWCallPoolSchema);