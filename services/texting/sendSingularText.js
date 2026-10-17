var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign');
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Lookup = require('./swPhoneLookup')
var Activity = require('../../models/activities/activity')
const { RestClient } = require("@signalwire/compatibility-api");
const API_TOKEN = process.env.signalWireAPIToken
const spaceURL = process.env.signalWireSpaceURL
const sendSingularText = async(incomingTextbankContactHistory) => {

    var orgID = incomingTextbankContactHistory.orgID;

    var campaign = await Campaign.findOne({campaignID:  incomingTextbankContactHistory.campaignID})
    if(!campaign) return {status: false, message: "Campaign not found."}

    if(campaign.textingFundedByCreatorOrg){
        orgID = campaign.creatorOrg 
    }
  
    var org = await Organization.findOne({'_id': orgID})

    if(!org || !org.signalWireAccount || !org.signalWireAccount.accountID) return {status: false, message: "No SignalWire Account Linked."}

    // 10 digits, without formatting or a leading country code, before the carrier lookup and the send
    var details = incomingTextbankContactHistory.textbankContactDetails || {}
    var residentDigits = String(details.residentPhonenumber || '').replace(/\D/g, '')
    if(residentDigits.length === 11 && residentDigits.startsWith('1')) residentDigits = residentDigits.slice(1)
    if(residentDigits.length !== 10) return {status: false, message: "Enter a 10-digit US phone number."}
    details.residentPhonenumber = residentDigits
    incomingTextbankContactHistory.textbankContactDetails = details
      
    var accountID = org.signalWireAccount.accountID
    const client = RestClient(accountID, API_TOKEN, { signalwireSpaceUrl: spaceURL });
    var record = await Lookup.swPhoneLookup(incomingTextbankContactHistory)
    var activity = await Activity.findOne({_id: incomingTextbankContactHistory.activityID})

    if(record.deviceType === 'mobile'){

        var outGoingMessage = {
            from: incomingTextbankContactHistory.textbankContactDetails.userPhonenumber,
            to: '+1' + incomingTextbankContactHistory.textbankContactDetails.residentPhonenumber,
        }
    
        if(incomingTextbankContactHistory.textbankContactDetails.initTextMessage  && incomingTextbankContactHistory.textbankContactDetails.initTextMessage != ''){
            outGoingMessage.body = incomingTextbankContactHistory.textbankContactDetails.initTextMessage
        }
    
        if(incomingTextbankContactHistory.textbankContactDetails.imageUrl){
            outGoingMessage.mediaUrl = incomingTextbankContactHistory.textbankContactDetails.imageUrl
        }
    
        // A rejected send must not be recorded as a successful text
        try {
            await client.messages.create(outGoingMessage)
        } catch(sendError){
            console.log(sendError)
            return {status: false, message: sendError.message || "The text could not be sent."}
        }

        // Keep one conversation per person per activity: continue an existing thread if there is one
        var existingTextContactHistory = await ActivityContactRecord.findOne({activityID: incomingTextbankContactHistory.activityID,
                                                                             activityType: "Texting",
                                                                             'textbankContactDetails.residentPhonenumber': details.residentPhonenumber,
                                                                             'textbankContactDetails.userPhonenumber': details.userPhonenumber}).sort({creationDate: -1})

        if(existingTextContactHistory){
            existingTextContactHistory.textbankContactDetails.textConvo.push(...details.textConvo)
            existingTextContactHistory.textbankContactDetails.textSuccessful = true
            if(details.imageUrl) existingTextContactHistory.textbankContactDetails.imageUrl = details.imageUrl
            await existingTextContactHistory.save()
        } else {
            var newTextContactHistory = new ActivityContactRecord(incomingTextbankContactHistory)
            newTextContactHistory.textbankContactDetails.textSuccessful = true
            await newTextContactHistory.save()
        }

        return {status: true, message: "Text Sent Successfully!"}     
    }

    return {status: false, message: "This number is not a mobile number."}     


}

module.exports = {sendSingularText}
