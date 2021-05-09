var Organization = require('../../models/organizations/organization')
var IncomingTwilioRecord = require('../../models/activities/hotline/incomingTwilioRecord');
var Campaign = require('../../models/campaigns/campaign')

const redirectCall = async(detail) => {
    try {

        console.log("Redirecting call...")

        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

        var orgID = '';

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        else{orgID = detail.orgID}

        var org = await Organization.findOne({"_id": orgID})
        
        var twilioRecord = await IncomingTwilioRecord.findOne({callSid: detail.callSid})

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var twiml = "<Response><Dial>" + detail.redirectPhoneNum + " </Dial></Response>"

        client.calls(twilioRecord.parentCallSid)
        .update({method: 'POST', twiml:twiml})

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {redirectCall}