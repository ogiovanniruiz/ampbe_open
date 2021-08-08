var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NonresponseContactSchema = new Schema({
    date: {type: Date, default: Date.now},
    nonResponseSetID: {type: String},
    contactedBy: {type: String},
    nonResponseType: {type: String}, 
    nonResponse: {type: String}}
);

//Export model
module.exports = mongoose.model('NonresponseContact', NonresponseContactSchema);
