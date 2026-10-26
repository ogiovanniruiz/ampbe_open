var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Each org's uploaded Google service-account key, used by the Sheets and BigQuery syncs.
// Kept out of the Organization doc because org fetches send the whole doc to the browser;
// only clientEmail and projectId ever leave the server.
var OrgServiceAccountSchema = new Schema({
    orgID: {type: String, required: true, unique: true},
    key: {type: String, required: true}, // the key file's JSON text
    clientEmail: {type: String},
    projectId: {type: String},
    updatedAt: {type: Date, default: Date.now},
  },
  { collection : 'orgserviceaccounts' }
);

//Export model
module.exports = mongoose.model('OrgServiceAccount', OrgServiceAccountSchema);
