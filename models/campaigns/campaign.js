var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CampaignSchema = new Schema(
  {
    campaignID: {type: Number},
    name: {type: String},
    orgIDs: [{type: String}],
    description: {type: String},
    active: {type: Boolean, default: true},
    requests: [{type: String}],
    boundaryIDs: [{type: String}],
    electionType: {type: String, enum: ['General', 'Primary', 'Special', 'Political Purpose', 'Nonpolitical Purpose']},
    electionYear: {type: String},
    fundedByCreatorOrg: {type: Boolean, default: false},
    textingFundedByCreatorOrg: {type: Boolean, default: false},
    creatorOrg: {type: String},
    geographical: {type: Boolean, default: false},
    sleep: {type: Boolean, default: false},
    allOrgPolygons: {type: Boolean, default: false},
    showNearestPollingLocations: {type: Boolean, default: false},
    showPartisan: {type: Boolean, default: false},
    defaultCampaignWideGroupID: {type: String, default: null},
  }
);


//Export model
module.exports = mongoose.model('Campaign', CampaignSchema);
