var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TextRecordsSchema = new Schema({
    date: {type: Date, default: Date.now}, 
    contactedBy: {type: String}, 
    deviceType: {type: String}, 
    personID: {type: String},
    phone: {type: String},
    error: {type: Boolean},
    message: {type: String},
    provider: {type: String}
    }
);

//Export model
module.exports = mongoose.model('TextRecords', TextRecordsSchema);