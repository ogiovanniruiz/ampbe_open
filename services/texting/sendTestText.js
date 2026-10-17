var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign');
const { RestClient } = require("@signalwire/compatibility-api");
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL

const sendTestText = async(detail) => {
    try { 

        var orgID = detail.orgID;

        var campaign = await Campaign.findOne({campaignID:  detail.campaignID})

        if(campaign.textingFundedByCreatorOrg){
            orgID = campaign.creatorOrg 
        }
  
        var org = await Organization.findOne({'_id': orgID})
      
        if(!org || !org.signalWireAccount || !org.signalWireAccount.accountID){
            return {success: false, msg: 'This organization has no texting account set up.'}
        }

        // Digits only, without a leading US country code
        var phonenumber = String(detail.targetPhonenumber || '').replace(/\D/g, '')
        if(phonenumber.length === 11 && phonenumber.startsWith('1')) phonenumber = phonenumber.slice(1)
        if(phonenumber.length !== 10){
            return {success: false, msg: 'Enter a 10-digit US phone number.'}
        }
      
        var accountID = org.signalWireAccount.accountID

        const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });

        var messegeDetails = {
            from: detail.userPhonenum,
            to: '+1' + phonenumber,
        }

        if(detail.initTextMsg  && detail.initTextMsg != ''){
            messegeDetails.body = detail.initTextMsg
        }


        if(detail.sendImage){
            messegeDetails.mediaUrl = detail.imageUrl
        }

        if(!messegeDetails.body && !messegeDetails.mediaUrl){
            return {success: false, msg: 'This activity has no opening message to send.'}
        }

        // SignalWire rejections (bad number, unverified sender…) come back as a message, not a server error
        try {
            await client.messages.create(messegeDetails)
        } catch(sendError){
            console.log(sendError)
            return {success: false, msg: sendError.message || 'The text could not be sent.'}
        }

        return {success: true}

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendTestText}
