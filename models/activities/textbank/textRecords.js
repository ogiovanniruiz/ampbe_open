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

// Texting skips numbers that are not mobile or failed to send (getNonTextablePhones);
// these let that lookup read phones straight from the index
TextRecordsSchema.index({deviceType: 1, phone: 1})
TextRecordsSchema.index({error: 1, phone: 1}, {partialFilterExpression: {error: true}})

//Export model
module.exports = mongoose.model('TextRecords', TextRecordsSchema);