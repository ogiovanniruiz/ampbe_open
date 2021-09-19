var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')

const removeOrg = async(detail) => {
    try { 

        var orgID = detail.orgID
        var campaignID = detail.campaignID
    
        var campaign = await Campaign.findOne({campaignID: campaignID})
        var org = await Organization.findOne({_id: detail.orgID})
    
        if (campaign.orgIDs.includes(orgID)){
            for( var i = 0; i < campaign.orgIDs.length; i++){ 
                if (campaign.orgIDs[i] === orgID) {
                    campaign.orgIDs.splice(i, 1); 
                }
            } 
        }
    
        if (org.campaignIDs.includes(campaignID)){
            for( var i = 0; i < org.campaignIDs.length; i++){ 
                if (org.campaignIDs[i] === campaignID.toString()) {
                    org.campaignIDs.splice(i, 1); 
                }
            } 
        }
    
        campaign.save()
        org.save()
        return {success: true, org: org, campaign: campaign,msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeOrg}