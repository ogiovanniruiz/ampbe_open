var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')

const getCampaignOrgs = async(data) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: data.campaignID})
        var orgIDs = campaign.orgIDs
        return await Organization.find({_id: {$in: orgIDs}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignOrgs}