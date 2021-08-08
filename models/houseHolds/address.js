var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AddressesSchema = new Schema(
    {
        streetNum: {type: String},
        prefix: {type: String, uppercase: true},
        street: {type: String, uppercase: true},
        suffix: {type: String, uppercase: true},
        city: {type: String, uppercase: true},
        state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
        zip: {type: String},
    }
);

//Export model
module.exports = mongoose.model('Addresses', AddressesSchema);
