var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var HouseHold = require('../../houseHolds/houseHold');

var CanvassHouseHoldRecordSchema = new Schema({
    activityID: {type: String},
    lockedBy: {type: String},
    complete: {type: Boolean, default: false},
    passed: {type: Boolean, default: false},
    residentStatus: [{type: String}],
    numResContacted: {type: Number, default: 0},
    houseHold: HouseHold.schema,
    date: {type: Date, default: Date.now}
    }
);

//Export model
module.exports = mongoose.model('Canvasshouseholdrecord', CanvassHouseHoldRecordSchema);