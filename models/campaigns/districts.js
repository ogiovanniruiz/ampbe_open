var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DistrictsSchema = new Schema(
    {
        properties: {
            name: {type: String},
            state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
            districtType: {type: String, enum: ['COUNTY', 'CITYWIDE', 'CITYWARD', 'ASSEMBLY', 'CONGRESSIONAL', 'BOARD OF EQUALIZATION', 'SENATE', 'RECREATIONAL', 'SCHOOL', 'WATER', 'STATEWIDE', 'SCHOOLDISTRICT']},
            identifier: {type: String},
            demographics: {
                totalPop: {type: Number},
            }
        },
        geometry: {},
        type: {type: String}
    }
);

//Export model
module.exports = mongoose.model('Districts', DistrictsSchema);
