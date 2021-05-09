var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Districts = require('./districts')

autoIncrement = require('mongoose-auto-increment');

var CampaignSchema = new Schema(
  {
    campaignID: {type: Number},
    name: {type: String},
    orgIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    requests: [{type: String}],
    dataManagers: [{type: String}],
    boundary: [{type: Districts.schema}],
    electionType: {type: String},
    fundedByCreatorOrg: {type: Boolean, default: false},
    creatorOrg: {type: String},
    geographical: {type: Boolean, default: false},
    blockgroupIDS: [],
    precinctIDS: [],
  }
);

autoIncrement.initialize(mongoose.connection);
CampaignSchema.plugin(autoIncrement.plugin, {model:'Campaign', field: 'campaignID'});

//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);
