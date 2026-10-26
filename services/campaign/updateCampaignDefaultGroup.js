var Campaign = require('../../models/campaigns/campaign')

const updateCampaignDefaultGroup = async(request) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: request.campaignID})
        campaign.defaultCampaignWideGroupID = request.groupID
    
        return await campaign.save()


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateCampaignDefaultGroup}