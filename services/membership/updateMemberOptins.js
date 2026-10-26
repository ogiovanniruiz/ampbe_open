var Membership = require('../../models/people/membership');
var {normalizePhone, personIDQuery} = require('./memberUtils')
var {applyConsent} = require('./consent')

// Adds texting/email consent to a member already on the org's list (found by personID).
// Consent is only ever added here, never removed. Returns {success, member} or {success: false, msg}.
const updateMemberOptins = async(data) => {
    try {
        var member = await Membership.findOne({'enrollment.orgID': data.orgID, ...personIDQuery(data.personID)})
        if(!member) return {success: false, msg: "This person isn't on the member list yet."}

        // The number/email they consented with becomes their first contact
        var phonenumber = normalizePhone(data.phonenumber)
        if(data.optinTexting && phonenumber.length === 10){
            var phones = (member.resident.phones || []).filter(p => normalizePhone(p.number) !== phonenumber)
            member.resident.phones = [{type: '?', number: phonenumber}, ...phones]
        }

        var email = String(data.email || '').trim().toLowerCase()
        if(data.optinEmail && email){
            var emails = (member.resident.emails || []).filter(e => String(e || '').toLowerCase() !== email)
            member.resident.emails = [email, ...emails]
        }

        applyConsent(member, {texting: data.optinTexting, email: data.optinEmail})

        await member.save()
        return {success: true, member: member}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateMemberOptins}
