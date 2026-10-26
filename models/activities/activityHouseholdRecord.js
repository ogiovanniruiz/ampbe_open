var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Household = require('../households/household');

var ActivityHouseholdRecordSchema = new Schema({
    activityID: {type: String},
    complete: {type: Boolean, default: false},
    passed: {type: Boolean, default: false},
    household: Household.schema,
    date: {type: Date, default: Date.now},
    timesContacted: {type: Number, default: 0},
    locked: {type: Boolean, default: false},
    lockedBy: {type: String},
    // Dropped on the map by a canvasser (community opt-in) instead of coming from the voter file
    dropped: {type: Boolean, default: false},
    droppedBy: {type: String},
    // Texting: "<pass>:<personID>" for each initial text claimed, so a person is texted once per pass
    textedKeys: {type: [String], default: undefined},
    }
);

//Export model
module.exports = mongoose.model('ActivityHouseholdrecord', ActivityHouseholdRecordSchema);