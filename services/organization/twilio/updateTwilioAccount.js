var Organization = require('../../../models/organizations/organization')

const updateTwilioAccount = async(orgID) => {
    try { 
        var org = await Organization.findOne({"_id": orgID.orgID})
        var out_going_voice_url = process.env.be + '/api/call'
        var sms_url = process.env.be + '/api/receiveText'

        const subClient = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
        var app = await subClient.applications.list({sid: org.twilioAccount.app_sid})

        app[0].update({voiceUrl: out_going_voice_url})

        var phonenums = await subClient.incomingPhoneNumbers.list()

        for(var i = 0; i < phonenums.length; i++){
            await subClient.incomingPhoneNumbers(phonenums[i].sid).update({smsUrl: sms_url, voiceUrl: ""}).then(incoming_phone_number => {return incoming_phone_number}).catch(e => {return e.message});
        }

        return 
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateTwilioAccount}