var Campaign = require('../../models/campaigns/campaign');
var CallPool = require('../../models/organizations/callPool')

const hangUpAllNumbers = async(orgDetail) => {
    try {

        var campaign = await Campaign.findOne({campaignID:  orgDetail.campaignID})
        
        if(campaign.fundedByCreatorOrg){
            return await CallPool.updateMany({orgID: campaign.creatorOrg}, {$set: {available: true}})
        }
            
        return await CallPool.updateMany({orgID: orgDetail.orgID}, {$set: {available: true}})
       
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {hangUpAllNumbers}