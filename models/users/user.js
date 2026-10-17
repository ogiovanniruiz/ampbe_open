var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrgPermissions = require('./orgPermissions')
var Name = require('../people/name')

var UserSchema = new Schema(
  {
    name: Name.schema,
    password: {type: String, select: false},
    dev: {type: Boolean, default: false},
    loginEmail: {type: String},
    orgPermissions: [OrgPermissions.schema],
    homeOrgID: {type: String},
    dataManager: [{type: Number}],
    userAgreements: [{version: String, orgID: String, date: {type: Date, default: Date.now}}],
    oauths: [{type: String, enum:["https://accounts.google.com", 'facebook']}],
    swSub: {}
  },
  {
    // Never send the password hash to clients, even when a query selected it
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      }
    }
  }
);

//Export model
module.exports = mongoose.model('User', UserSchema);
