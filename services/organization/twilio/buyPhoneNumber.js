var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/callPool')

const buyPhoneNumber = async(detail) => {
    try { 
        var org = await Organization.findOne({"_id": detail.orgID})

        if(!org.twilioAccount.sid || !org.twilioAccount.authToken){
            return {msg: "Twilio account not set up.", success: false}
        }
            
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
        var sms_url = process.env.be + '/api/receiveTwilioText'
        var voice_url = process.env.be + '/api/receiveCall'

        var numberSID = ''
        var success = true;
        var statusMsg = "Success."

        await client.incomingPhoneNumbers
                .create({areaCode: detail.areaCode})
                .then(incoming_phone_number => {
                    numberSID = incoming_phone_number.sid
                })
                .catch(e => {
                    statusMsg = e.message
                    success = false;
                });
            
        if(!success){
            return { msg: statusMsg, success: success}
        }

        var newTwilioNum = await client.incomingPhoneNumbers(numberSID)
                .update({smsUrl: sms_url//,voiceUrl: voice_url
                })
                .then(incoming_phone_number => {return incoming_phone_number})
                .catch(e => {
                    statusMsg = e.message
                    success = false
                    return e.message
                });

        var newPoolNumber = {number: newTwilioNum.phoneNumber, orgID: detail.orgID}

        var newCallPoolNumber = new CallPool(newPoolNumber)
        newCallPoolNumber.save()

        const profiles = await client.trusthub.v1.customerProfiles.list({ limit: 1 });

        const customerProfileSid = profiles[0].sid;

        await client.trusthub.v1.customerProfiles(customerProfileSid).customerProfilesChannelEndpointAssignment
        .create({
          channelEndpointType: "phone-number",
          channelEndpointSid: newTwilioNum.sid,
        });

        const approved_shaken_accounts = await client.request({
        method: 'GET',
        uri: `https://trusthub.twilio.com/v1/TrustProducts?PolicySid=RN7a97559effdf62d00f4298208492a5ea&Status=twilio-approved`,
        })

        const approved_shaken_account_sid = approved_shaken_accounts.body.results?.[0]?.sid;

        await client.trusthub.v1.trustProducts(approved_shaken_account_sid).trustProductsChannelEndpointAssignment
        .create({
          channelEndpointType: "phone-number",
          channelEndpointSid: newTwilioNum.sid,
        });

        const approved_voice_tegrity_accounts = await client.request({
        method: 'GET',
        uri: `https://trusthub.twilio.com/v1/TrustProducts?PolicySid=RN5b3660f9598883b1df4e77f77acefba0&Status=twilio-approved`,
      })

        const approved_voice_tegrity_account_sid = approved_voice_tegrity_accounts.body.results?.[0]?.sid;

        await client.trusthub.v1.trustProducts(approved_voice_tegrity_account_sid).trustProductsChannelEndpointAssignment
        .create({
          channelEndpointType: "phone-number",
          channelEndpointSid: newTwilioNum.sid,
        });

        return { msg: statusMsg, success: success}


    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {buyPhoneNumber}