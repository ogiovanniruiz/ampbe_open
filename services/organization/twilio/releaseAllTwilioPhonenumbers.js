var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/callPool')

const releaseAllTwilioPhonenumbers = async(detail) => {
    try { 
        
        var org = await Organization.findById(detail.orgID)
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);


        for(let i = 0; i < detail.twilioNumbers.length; i++) {
            let phoneNumber = detail.twilioNumbers[i];
            await client.incomingPhoneNumbers(phoneNumber.sid).remove();
        }

        return  CallPool.deleteMany({orgID: detail.orgID})


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {releaseAllTwilioPhonenumbers}