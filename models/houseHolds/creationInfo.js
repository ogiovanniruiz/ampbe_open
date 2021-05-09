var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CreationInfoSchema = new Schema(
    {
        userID: {type: String},
        orgID: {type: String},
        date: {type: Date, default: Date.now},
        creationType: {type: String, enum: ['SELF','MANUAL','MEMBERLIST', 'VOTERFILE']},
    }
);

//Export model
module.exports = mongoose.model('CreationInfo', CreationInfoSchema);