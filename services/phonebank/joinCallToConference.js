var Organization = require('../../models/organizations/organization')

const joinCallToConference = async(call) => {

    try {
        var org = await Organization.findOne({'twilioAccount.sid': call.AccountSid})
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
    
        var conference_room_name = call.CallSid
    
        await client.calls.create(
            {
                to: call.residentPhonenumber,  
                from : call.userPhonenumber, 
                twiml:'<Response><Dial><Conference>' + conference_room_name + '</Conference></Dial></Response>',
            }
        )

    } catch (error) {
        console.error("Error joining call to conference:", error);
        return false;
    }



}

module.exports = {joinCallToConference}