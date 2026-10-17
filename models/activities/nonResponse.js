var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NonresponseSchema = new Schema({
    nonResponseSetID: {type: String},
    nonResponseType: {type: String}, 
    nonResponse: {type: String}}
);

//Export model
module.exports = mongoose.model('Nonresponse', NonresponseSchema);
