var Organization = require('../../../models/organizations/organization')

const getOrgPhoneNumbers = async(detail) => {
    try {

        var org = await Organization.findOne({"_id": detail.orgID})
        if(!org) throw new Error("Organization not found")

        if(org.twilioAccount.sid && org.twilioAccount.authToken){
            const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
            return await client.incomingPhoneNumbers.list({limit: 40}).then(incomingPhoneNumbers => {return incomingPhoneNumbers});
        }

        return []

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgPhoneNumbers}