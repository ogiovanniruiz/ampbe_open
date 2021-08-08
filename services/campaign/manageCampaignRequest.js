var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')

const manageCampaignRequest = async(detail) => {
    try { 
        var orgID = detail.orgID
        var campaignID = detail.campaignID
    
        var campaign = await Campaign.findOne({campaignID: campaignID})
        var org = await Organization.findOne({_id: detail.orgID})
    
        if (campaign.requests.includes(orgID)){
            for( var i = 0; i < campaign.requests.length; i++){ 
                if (campaign.requests[i] === orgID) {
                    campaign.requests.splice(i, 1); 
                }
            } 
        }
    
        if(detail.action === 'APPROVE'){
            campaign.orgIDs.push(orgID)
            org.campaignIDs.push(campaignID)
            org.save()
            return campaign.save()
        }else {
            return campaign.save()
        }
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {manageCampaignRequest}