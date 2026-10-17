var Voters = require('../../../models/people/people');
var GeocodeOneMember = require('../createMember/geocodeOneMember');

const digitsOnly = (value) => String(value || '').replace(/\D/g, '')

// Exactly one voter or nothing: several voters fitting the same details is ambiguous
const findSingle = async(query) => {
    var voters = await Voters.find(query).limit(2)
    if(voters.length === 1) return {voter: voters[0], ambiguous: false}
    return {voter: null, ambiguous: voters.length > 1}
}

/**
 * Finds the one voter this member is, by first + last name plus either
 *   1. a phone number or email they gave, or
 *   2. their zip code, when contact details don't match.
 * Never matches on name alone. Returns {voter, step} (voter null when there's no single match).
 */
const matchVoter = async(member) => {
    var resident = member.resident || {}
    var firstName = String(resident.name && resident.name.firstName || '').trim().toUpperCase()
    var lastName = String(resident.name && resident.name.lastName || '').trim().toUpperCase()
    if(!firstName || !lastName) return {voter: null, step: 'no name'}

    var names = {'resident.name.firstName': firstName, 'resident.name.lastName': lastName}

    var phones = (resident.phones || []).map(p => digitsOnly(p && p.number).slice(-10)).filter(p => p.length === 10)
    var emails = (resident.emails || []).map(e => String(e || '').trim().toLowerCase()).filter(Boolean)

    var contact = []
    if(phones.length) contact.push({'resident.phones.number': {$in: phones}})
    if(emails.length) contact.push({'resident.emails': {$in: emails}})

    if(contact.length){
        var byContact = await findSingle({...names, $or: contact})
        if(byContact.voter) return {voter: byContact.voter, step: 'contact'}
        if(byContact.ambiguous) return {voter: null, step: 'ambiguous contact'}
    }

    var zip = digitsOnly(member.address && member.address.zip).slice(0, 5)
    if(zip.length === 5){
        var byZip = await findSingle({...names, 'address.zip': {$regex: '^' + zip}})
        if(byZip.voter) return {voter: byZip.voter, step: 'zip'}
        if(byZip.ambiguous) return {voter: null, step: 'ambiguous zip'}
    }

    return {voter: null, step: 'no match'}
}

// Links a member to their voter record when there is exactly one match, and geocodes a typed address.
// Never throws: the member is already saved, so a failure here must not look like a failed save.
const findOneVoter = async(member) => {
    try {
        var {voter, step} = await matchVoter(member)
        var typedAddress = !!member.fullAddress1

        if(voter){
            console.log("Voter Found by " + step + ".")
            member.isRegisteredVoter = true;
            member.resident.voterID = voter.resident.voterID;
            member.resident.ampID = voter.resident.ampID;

            if(!(member.resident.phones || []).length){
                member.resident.phones = voter.resident.phones
            }

            if(!(member.resident.emails || []).length){
                member.resident.emails = voter.resident.emails
            }

            if(!typedAddress){
                console.log("No Address Provided. Using Voter Record Address.")
                member.address = voter.address
                member.fullAddress1 = voter.fullAddress1
                member.fullAddress2 = voter.fullAddress2

                member.districts = voter.districts
                member.location = voter.location

                member.geocoded = true
                member.accuracyType = voter.accuracyType
                member.county = voter.county
                member.blockID = voter.blockID
                member.electionPrecinctID = voter.electionPrecinctID
                member.registrationPrecinctID = voter.registrationPrecinctID
            }

            await member.save();
        } else {
            console.log("No single voter match (" + step + ").")
        }

        // A typed address gets its own location and districts, voter or not
        if(typedAddress){
            await GeocodeOneMember.geocodeOneMember(member)
        }
    } catch(e){
        console.log("Voter check failed: " + e.message)
    }

    return member
}

// Geocodes a typed address without the voter check (petitions with the check turned off)
const geocodeOnly = async(member) => {
    try {
        if(member.fullAddress1) await GeocodeOneMember.geocodeOneMember(member)
    } catch(e){
        console.log("Geocoding failed: " + e.message)
    }
    return member
}

module.exports = {findOneVoter, matchVoter, geocodeOnly}
