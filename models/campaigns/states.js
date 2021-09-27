var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatesSchema = new Schema(
    {
        properties: {
            state: {name: {type: String, uppercase: true},
                    abbrv: {type: String, uppercase: true}},
            demographics: {
            }
        },
        geometry: {},
        type: {type: String}
    }
);

//Export model
module.exports = mongoose.model('States', StatesSchema);
