var Organization = require('../../../models/organizations/organization')
var Campaign = require('../../../models/campaigns/campaign');

const getOrgPhoneNumbers = async(detail) => {
    try {

        var org;

        if(detail.campaignID){
            var campaign = await Campaign.findOne({campaignID:  detail.campaignID})
            
            if(campaign.fundedByCreatorOrg){
                org = await Organization.findOne({"_id": campaign.creatorOrg})
    
            }else{
                org = await Organization.findOne({"_id": detail.orgID})
            }

        }else{
            org = await Organization.findOne({"_id": detail.orgID})
        
        }

        if(org.twilioAccount.sid && org.twilioAccount.authToken){
            const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
            return await client.incomingPhoneNumbers.list({limit: 20}).then(incomingPhoneNumbers => {return incomingPhoneNumbers});
        }

        return []

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgPhoneNumbers}