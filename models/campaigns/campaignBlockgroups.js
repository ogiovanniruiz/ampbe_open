var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Name = require('../people/name')

var CampaignBlockgroupsSchema = new Schema(
    {
        geometry: {},
        properties: { 
                      geoid: String,
                      campaignID: [Number],
                      state: {abbrv: {type: String, uppercase: true}, name: {type: String, uppercase: true}},
                      
        }
    }
);

//Export model
module.exports = mongoose.model('CampaignBlockgroups', CampaignBlockgroupsSchema);