var Campaign = require('../../models/campaigns/campaign')

const requestCampaign = async(request) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: request.campaignID})
        if (!campaign) return {success: false, msg:"Campaign does not exist."}
        
        var orgIsCampaignMember = await Campaign.findOne({orgIDs: request.orgID, campaignID: request.campaignID})
        if (orgIsCampaignMember) return {success: false, msg:"Oranization is already a member of this campaign."}

        var campaignIsRequested = await Campaign.findOne({requests: request.orgID, campaignID: request.campaignID})
        if (campaignIsRequested ) return {success: false, msg:"Request has already been sent to this campaign."}
        
        campaign.requests.push(request.orgID)
        await campaign.save()

        return {success: true, msg: "Success."}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {requestCampaign}