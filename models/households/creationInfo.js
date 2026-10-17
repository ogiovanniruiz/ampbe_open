var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CreationInfoSchema = new Schema(
    {
        userID: {type: String},
        orgID: {type: String},
        date: {type: Date, default: Date.now},
        creationType: {type: String, uppercase: true, enum: ['SELF','MANUAL','CONTACTLIST', 'VOTERFILE']},
    }
);

//Export model
module.exports = mongoose.model('CreationInfo', CreationInfoSchema);