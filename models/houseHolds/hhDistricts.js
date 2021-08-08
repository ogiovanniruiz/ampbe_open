var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HHDistrictsSchema = new Schema(
    {
        countyID: {type: String},
        citywideID: {type: String},
        citywardID: {type: String},
        assemblyID: {type: String},
        senateID: {type: String},
        congressionalID: {type: String},
        recreationalID: {type: String},
        schoolID: {type: String},
        waterID: {type: String},
    }
);

//Export model
module.exports = mongoose.model('HHDistricts', HHDistrictsSchema);
