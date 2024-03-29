var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    boundaryIDs: [{type: String}],
    electionType: {type: String},
    fundedByCreatorOrg: {type: Boolean, default: false},
    creatorOrg: {type: String},
    geographical: {type: Boolean, default: false},

  }
);

autoIncrement.initialize(mongoose.connection);
CampaignSchema.plugin(autoIncrement.plugin, {model:'Campaign', field: 'campaignID'});

//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);
