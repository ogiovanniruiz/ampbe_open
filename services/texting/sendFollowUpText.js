var Campaign = require('../../models/campaigns/campaign');
var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const { RestClient } = require("@signalwire/compatibility-api");
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL

var Organization = require('../../models/organizations/organization')

const sendFollowUpText = async(detail) => {
    try { 

        var orgID = detail.selectedTextContactRecord.orgID;

        var campaign = await Campaign.findOne({campaignID:  detail.selectedTextContactRecord.campaignID})

        if(campaign.textingFundedByCreatorOrg){
            orgID = campaign.creatorOrg 
        }
  
        var org = await Organization.findOne({'_id': orgID})
      
        if(!org.signalWireAccount) return false
        if(!org.signalWireAccount.accountID) return false
      
        var accountID = org.signalWireAccount.accountID

        const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });

        var message =  await client.messages.create({
            body: detail.textMsg, 
            from: detail.selectedTextContactRecord.textbankContactDetails.userPhonenumber,
            to: '+1' + detail.selectedTextContactRecord.textbankContactDetails.residentPhonenumber,
        }).then(message => {return message   
        }).catch(e => { return e});

        var textContactHistory = await ActivityContactRecord.findById(detail.selectedTextContactRecord._id)

        // A rejected send has no body; keep what the volunteer typed so the failed text stays readable
        textContactHistory.textbankContactDetails.textConvo.push({msg: message.body ?? detail.textMsg, origin: 'USER', error: message.message})
        return textContactHistory.save()

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendFollowUpText}