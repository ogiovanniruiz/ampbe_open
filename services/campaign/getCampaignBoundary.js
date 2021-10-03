var Districts = require('../../models/campaigns/districts')
var Campaign = require('../../models/campaigns/campaign')

const getCampaignBoundary = async(data) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: data.campaignID})
        return await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs}})
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignBoundary}