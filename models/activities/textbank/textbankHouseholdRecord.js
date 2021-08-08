var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HouseHold = require('../../houseHolds/houseHold');

var textbankHouseHoldRecordSchema = new Schema({
    activityID: {type: String},
    initTextSent: {type: Boolean, default: false}, 
    textReceived: {type: Boolean, default: false}, 
    lockedBy: {type: String},
    numTextSent: {type: Number, default: 0},
    numResContacted: {type: Number, default: 0},
    houseHold: HouseHold.schema,
    date: {type: Date, default: Date.now}
    }
);

//Export model
module.exports = mongoose.model('textbankHouseHoldRecord', textbankHouseHoldRecordSchema);
