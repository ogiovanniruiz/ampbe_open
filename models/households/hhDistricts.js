var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HHDistrictsSchema = new Schema(
    {
        countyID: {type: String},
        bosID: {type: String},
        citywideID: {type: String},
        citywardID: {type: String},
        assemblyID: {type: String},
        senateID: {type: String},
        congressionalID: {type: String},
        new_congressionalID: {type: String},
        recreationalID: {type: String},
        schooldistrictID: {type: String},
        schoolID: {type: String},
        boeID: {type: String},
        schooldistrictareaID: {type: String},
        waterID: {type: String},
    },
    // Embedded in households, people and members; a districts object has no id of its own
    {_id: false}
);

//Export model
module.exports = mongoose.model('HHDistricts', HHDistrictsSchema);
