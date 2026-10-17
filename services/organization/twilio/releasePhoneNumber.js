var Organization = require('../../../models/organizations/organization')
var CallPool = require('../../../models/organizations/callPool')

const releasePhoneNumber = async(detail) => {
    try { 
        var org = await Organization.findById(detail.orgID)
        const client = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);

        await CallPool.deleteOne({number: detail.phoneNumber.phoneNumber, orgID: detail.orgID})

        await client.incomingPhoneNumbers(detail.phoneNumber.sid).remove();
        return {success:true, org: org, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {releasePhoneNumber}