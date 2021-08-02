var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../users/user')

var ClinicSchema = new Schema(
    {
        location: {type: {type: String}, 
                   coordinates: {type: [Number]}},
	provider: {type: String},
	clinic: {type: String},
	address: {type: String},
	website: {type: String},
	startDate: {type: Date, default: Date.now},
	closeDate: {type: Date, default: Date.now},
	date: {type: Date, default: Date.now},
	opHours: {type: String}
     }
);

//Export model
module.exports = mongoose.model('Clinic', ClinicSchema);
