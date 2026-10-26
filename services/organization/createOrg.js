var Organization = require('../../models/organizations/organization')

const SUBSCRIPTIONS = ["FREE", "LITE", "CORE", "PLUS"]
const CALLING_SERVICES = ['twilio', 'signalwire']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const createOrg = async(detail) => {
    try { 
        var name = (detail.name || '').trim().replace(/\s+/g, ' ')
        if(!name) return {success: false, msg: "Organization needs a name."}

        var contactEmail = (detail.contactEmail || '').trim()
        if(contactEmail && !EMAIL_PATTERN.test(contactEmail)) return {success: false, msg: "Enter a valid contact email."}

        // Case-insensitive, so "Acme" and "acme " can't both exist
        var existingOrg = await Organization.findOne({name: {$regex: `^${escapeRegex(name)}$`, $options: 'i'}}, {_id: 1})
        if(existingOrg){
            return {success: false, msg: "Organization with that name already exists."}
        }

        var newOrg = {
            name,
            description: (detail.description || '').trim(),
            subscription: SUBSCRIPTIONS.includes(detail.subscription) ? detail.subscription : 'FREE',
        }
        if(contactEmail) newOrg.contactEmail = contactEmail
        if(CALLING_SERVICES.includes(detail.callingService)) newOrg.callingService = detail.callingService
        
        var org = new Organization(newOrg);
        await org.save()

        return {success: true, org: org, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createOrg}
