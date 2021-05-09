var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')

const getOrgCampaigns = async(orgDetail) => {
    try { 
        var org = await Organization.findOne({_id: orgDetail.orgID});

        var campaignIDs = org.campaignIDs;
        return await Campaign.find({campaignID: {$in: campaignIDs}}); 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgCampaigns}