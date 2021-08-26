var Organization = require('../../models/organizations/organization')
var _ = require ('underscore')
var Campaign = require('../../models/campaigns/campaign');
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

var People = require('../../models/people/people')
var Membership = require('../../models/organizations/membership')

var TextStatus = require('./textStatus')

const sendInitText = async(detail) => {
    try { 
        
        var campaign = await Campaign.findOne({campaignID:  detail.tbContactRecord.campaignID})
        var orgID = detail.tbContactRecord.orgID;

        if(campaign.fundedByCreatorOrg){orgID = campaign.creatorOrg}
        var org = await Organization.findOne({"_id": orgID})

        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var phonenumber = detail.resident.phones[0].number

        if(process.env.devMode == 'true'){
            phonenumber = process.env.testTextingNumber
        }

       var record = await TextStatus.textStatus(phonenumber, client, detail.resident.personID, detail.tbContactRecord.userID)

        var textSuccessful = false;
        var message = {}

        if(record.deviceType === 'mobile'){
            console.log("This is a mobile device. Sending text.")
            textSuccessful = true;
            message = await client.messages.create({
                body: detail.tbContactRecord.initTextMsg, 
                from: detail.tbContactRecord.userPhonenum,
                to: '+1' + phonenumber,
                //mediaUrl: 'https://demo.twilio.com/owl.png'
            }).then(message => {return message
            }).catch(e => { return e});
        }else{
            console.log("This is NOT a mobile device. Skipping texting.")
            message = {message: "Not a mobile device.", body: "Not a mobile device."}
       }

        var tbHouseHoldRecord = await TextbankHouseHoldRecord.findById(detail.houseHoldRecord._id)
        tbHouseHoldRecord.initTextSent = true;
        tbHouseHoldRecord.numTextSent = tbHouseHoldRecord.numTextSent + 1
        tbHouseHoldRecord.save()

        var newTextContactHistory = new TextbankContactHistory(detail.tbContactRecord)
        newTextContactHistory.residentPhonenum = phonenumber;
        newTextContactHistory.textConvo = [{msg: message.body, origin: 'USER', error: message.message}]
        newTextContactHistory.textSuccessful = textSuccessful

        var person = {}

        if(detail.tbContactRecord.idBy === 'MEMBERSHIP'){
            person = await Membership.findOne({'resident.personID': detail.resident.personID});
        }else{
            person = await People.findOne({'resident.personID': detail.resident.personID});
        }

        newTextContactHistory.person = person
        return newTextContactHistory.save()

    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {sendInitText}
