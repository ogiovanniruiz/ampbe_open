var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/callPool')

const buyPhoneNumber = async(detail) => {
    try { 
        var org = await Organization.findOne({"_id": detail.orgID})

        if(org.twilioAccount.sid && org.twilioAccount.authToken){
            const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
            var sms_url = process.env.be + '/api/receiveText'
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
            
            return { msg: statusMsg, success: success}
        }

        return{success: false, msg: "Failed to buy number."}

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {buyPhoneNumber}