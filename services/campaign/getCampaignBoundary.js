var Districts = require('../../models/campaigns/districts')
var States = require('../../models/campaigns/states')
var Campaign = require('../../models/campaigns/campaign')

const getCampaignBoundary = async(data) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: data.campaignID})
        return campaign.boundary

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignBoundary}