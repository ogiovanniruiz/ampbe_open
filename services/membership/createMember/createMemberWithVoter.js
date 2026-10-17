var Membership = require('../../../models/people/membership');
var Person = require('../../../models/people/people')
var Activity = require('../../../models/activities/activity')
var CheckExistingMember = require('./checkExistingMember')
var {applyConsent} = require('../consent')
var {toMemberTags, checkTagValues} = require('../memberTags')
var {newEnrollment, SOURCE_TYPE_BY_ACTIVITY} = require('../memberFields')

// US numbers as 10 digits, without formatting or a leading country code
const normalizePhone = (value) => {
    var digits = String(value || '').replace(/\D/g, '')
    return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

// Adds a voter to the org's Community Member List from an activity (opt-in form).
// Returns {success, matchedExisting, member} or {success: false, msg}.
const createMemberWithVoter = async(data) => {
    try {

        var voter = await Person.findOne({'resident.personID': data.personID},{_id:0})
        if(!voter) return {success: false, msg: "This person couldn't be found."}

        var activity = await Activity.findOne({_id: data.activityID})
        if(!activity) return {success: false, msg: "This activity couldn't be found."}

        // Only replace the voter's phone/email with values that were actually entered
        var phonenumber = normalizePhone(data.phonenumber)
        if(phonenumber) voter.resident.phones[0] = {type: "?", number: phonenumber}

        var email = String(data.email || '').trim()
        if(email) voter.resident.emails[0] = email

        var newMembershipData = {resident: voter.resident,
                                    enrollment: newEnrollment({
                                                    orgID: data.orgID,
                                                    source: SOURCE_TYPE_BY_ACTIVITY[activity.activityType],
                                                    sourceID: data.activityID,
                                                    createdBy: data.userID,
                                                    }),
                                    isRegisteredVoter: true,
                                    geocoded: true,
                                    tags: [],
                                    activityIDs: [data.activityID],
                                    address: voter.address,
                                    fullAddress1: voter.fullAddress1,
                                    fullAddress2: voter.fullAddress2,
                                    location: voter.location,
                                    accuracyType: voter.accuracyType,
                                    county: voter.county,
                                    districts: voter.districts,
                                    registrationPrecinctID: voter.registrationPrecinctID
                                }

        // Tags (and values) the volunteer picked; a picked consent tag counts as consent. A value the tag
        // doesn't offer is dropped rather than losing the whole sign-up.
        var picked = toMemberTags(data.tags)
        newMembershipData.tags = (await checkTagValues(data.orgID, picked.tags)).tags

        // Consent goes on enrollment; checkExistingMember also applies it to a matching existing member
        applyConsent(newMembershipData, {texting: data.optinTexting || picked.texting, email: data.optinEmail || picked.email})

        // Adds the tags to the org, and merges tags and consent into a matching existing member
        var checkedMember = await CheckExistingMember.checkExistingMember(newMembershipData)

        if(checkedMember){
            return {success: true, matchedExisting: true, member: checkedMember}
        }

        var newMembership = new Membership(newMembershipData)
        var saved = await newMembership.save()
        return {success: true, matchedExisting: false, member: saved}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createMemberWithVoter}
