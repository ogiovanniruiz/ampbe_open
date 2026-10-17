var Organization = require('../../models/organizations/organization')

const SUBSCRIPTIONS = ["FREE", "LITE", "CORE", "PLUS"]

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const editOrg = async(data) => {
    try { 
        var org = await Organization.findOne({_id: data.orgID})
        if(!org) return {success: false, msg: "This organization no longer exists."}

        if(data.command === 'edit'){
            var name = (data.name || '').trim().replace(/\s+/g, ' ')
            if(!name) return {success: false, msg: "Organization needs a name."}

            // Another organization with the same name (case-insensitive)
            var existingOrg = await Organization.findOne({_id: {$ne: org._id}, name: {$regex: `^${escapeRegex(name)}$`, $options: 'i'}}, {_id: 1})
            if(existingOrg){
                return {success: false, msg: "Organization with that name already exists."}
            }

            // Keep the Twilio subaccount's name in sync; a Twilio outage shouldn't block the save
            if(org.twilioAccount?.sid && org.name !== name){
                try {
                    const subClient = require('twilio')(org.twilioAccount.sid, org.twilioAccount.authToken);
                    await subClient.api.accounts(org.twilioAccount.sid).update({friendlyName: name})
                } catch(e){
                    console.log('Twilio rename failed:', e.message)
                }
            }

            org.name = name
            org.description = data.description
            org.contactEmail = data.contactEmail
            org.signalWireAccount = {...(org.signalWireAccount?.toObject?.() || org.signalWireAccount || {}), brandID: data.brandID}

            if(SUBSCRIPTIONS.includes(data.subscription)){
                org.subscription = data.subscription
            }

            if(['twilio', 'signalwire'].includes(data.callingService)){
                org.callingService = data.callingService
            }
        }

        if (data.command === 'activate'){
            org.active = true
        }

        if(data.command === 'deactivate'){
            org.active = false
        }

        await org.save()

        return {success: true, org: org, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editOrg}
