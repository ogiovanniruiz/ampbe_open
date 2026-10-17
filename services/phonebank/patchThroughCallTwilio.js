var Organization = require('../../models/organizations/organization')

const patchThroughCallTwilio = async(detail) => {
    try {
        var org = await Organization.findById(detail.orgID)
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        var conference_room_name = detail.callSid

        var string = '<Response><Dial><Conference>' + conference_room_name + '</Conference></Dial></Response>'

        // Awaited so a Twilio error is caught here instead of becoming an
        // unhandled rejection, which would take down the whole server
        await client.calls.create({
                to: detail.patchThroughNumber,
                from : detail.userPhonenumber,
                twiml: string
            }
        )

        return true

    } catch(e){
        console.log('patchThroughCallTwilio failed:', e.message)
        return false
    }
}

module.exports = {patchThroughCallTwilio}
