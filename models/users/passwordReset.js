var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PasswordResetSchema = new Schema(
    {
        email: {type: String},
        expireAt: {type: Date, default: function() {return new Date(Date.now() + 600000)}, index: { expires: '10m' }},
    }
);

//Export model
module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
