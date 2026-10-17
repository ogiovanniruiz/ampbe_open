var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var NameSchema = new Schema(
  {
    firstName: {type: String, uppercase: true},
    lastName: {type: String, uppercase: true},
    middleName: {type: String, uppercase: true},
    fullName: {type: String, uppercase: true}
  }
);


//Export model
module.exports = mongoose.model('Name', NameSchema);