var Campaign = require('../../models/campaigns/campaign')
var Organization = require('../../models/organizations/organization')

const getFundedStatus = async(data) => {
    try { 
        var campaign = await Campaign.findOne({campaignID:  data.campaignID})

        var orgID = '';

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        else{orgID = data.orgID}

        var org = await Organization.findById(orgID)

        return org.funded
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getFundedStatus}