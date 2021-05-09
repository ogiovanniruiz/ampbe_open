var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')

const getCampaignRequests = async(data) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: data.campaignID}); 
        var requests = campaign.requests;
        return await Organization.find({_id: {$in: requests}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignRequests}

