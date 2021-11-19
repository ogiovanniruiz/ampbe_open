var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign');
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

var People = require('../../models/people/people')
var Membership = require('../../models/organizations/membership')

var TextStatus = require('./textStatus')

const sendTestText = async(detail) => {
    try { 

        console.log(detail)

        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})
        var orgID = detail.orgID;

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        var org = await Organization.findOne({"_id": orgID})

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var phonenumber = detail.targetPhonenumber.replace('(', '').replace(')', '').replace('-', '').replace(' ', '');

        var messegeDetails = {
            body: detail.initTextMsg, 
            from: detail.userPhonenum,
            to: '+1' + phonenumber,
        }

        if(detail.sendImage){
            messegeDetails.mediaUrl = detail.imageUrl
        }

        return await client.messages.create(messegeDetails).then(message => {return message
        }).catch(e => { return e});


    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendTestText}
