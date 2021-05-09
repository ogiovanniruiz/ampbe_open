var Activity = require('../../models/activities/activity')
var Organization = require('../../models/organizations/organization')
var _ = require ('../../node_modules/underscore/underscore')
var Campaign = require('../../models/campaigns/campaign');
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const sendFollowUpText = async(detail) => {
    try { 
        var campaign = await Campaign.findOne({campaignID:  detail.selectedTextContactRecord.campaignID})

        var orgID = detail.selectedTextContactRecord.orgID;

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        var org = await Organization.findOne({"_id": orgID})

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var message =  await client.messages.create({
            body: detail.textMsg, 
            from: detail.selectedTextContactRecord.userPhonenum,
            to: '+1' + detail.selectedTextContactRecord.residentPhonenum,
        }).then(message => {return message   
        }).catch(e => { return e});

        
        var textContactHistory = await TextbankContactHistory.findById(detail.selectedTextContactRecord._id)

        textContactHistory.textConvo.push({msg: message.body, origin: 'USER', error: message.message})
        return textContactHistory.save()

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendFollowUpText}