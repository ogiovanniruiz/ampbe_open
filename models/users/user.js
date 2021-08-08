var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrgPermissions = require('./orgPermissions')
var Name = require('../people/name')

var UserSchema = new Schema(
  {
    name: Name.schema,
    password: {type: String},
    dev: {type: Boolean, default: false},
    loginEmail: {type: String},
    orgPermissions: [OrgPermissions.schema],
    dataManager: [{type: Number}],
    userAgreements: [{version: String, date: {type: Date, default: Date.now}}],
    oauths: [{type: String, enum:["https://accounts.google.com", 'facebook']}],
    swSub: {}
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);
