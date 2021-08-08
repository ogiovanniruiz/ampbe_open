var Organization = require('../../../models/organizations/organization')
var ClientCapability = require('twilio').jwt.ClientCapability;
var Campaign = require('../../../models/campaigns/campaign');

const getIncomingTwilioToken = async(detail) => {
    try { 
        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

        var orgID = detail.orgID;

        if(campaign.fundedByCreatorOrg){
            orgID = campaign.creatorOrg
        }

        var org = await Organization.findOne({"_id": orgID})

        var capability = new ClientCapability({
            accountSid: org.twilioAccount.sid,
            authToken: org.twilioAccount.authToken,
            ttl: 28800
          });

        var twilio_client = detail.userID + detail.activityID
        
        capability.addScope(new ClientCapability.IncomingClientScope(twilio_client));
        var token = capability.toJwt();
    
        return {token: token}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getIncomingTwilioToken}