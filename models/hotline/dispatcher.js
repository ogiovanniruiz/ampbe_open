var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../people/name')

var DispatcherSchema = new Schema(
  {
    orgID: {type: String},
    name: Name.schema,
    userID: {type: String},
    phonenumber: {type: String},
    email: {type: String},
    in_active_call: {type: Boolean, default: false},
    on_duty: {type: Boolean, default: false},
    date_created: {type: Date, default: Date.now}
  }
);

//Export model
module.exports = mongoose.model('Dispatcher', DispatcherSchema);