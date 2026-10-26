var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var TextRecord = require('../../models/activities/textbank/textRecords')
var member = require('../../models/people/membership')

const submitPetitionSurveyResponse = async(activityContactRecord) => {

    var membership = await member.findOne({'resident.personID': activityContactRecord.person.resident.personID})
    if (!membership) {
        throw new Error("No membership found for personID: " + activityContactRecord.person.resident.personID);
    }

    activityContactRecord.person = membership

    var newActivityContactRecord = new ActivityContactRecord(activityContactRecord)
    var saved = await newActivityContactRecord.save()

    await linkUnlinkedTexts(membership, activityContactRecord.activityID)

    return saved
}

// Texts sent from the form before the signer was saved have no personID yet; attach them to this member.
// A failure here must not fail the signature save.
const linkUnlinkedTexts = async(membership, activityID) => {
    try {
        var digits = (membership.resident.phones || [])
                        .map(p => String(p.number || '').replace(/\D/g, '').slice(-10))
                        .filter(d => d.length === 10)
        if(!digits.length) return

        var personID = membership.resident.personID
        var noPersonID = [{personID: null}, {personID: {$exists: false}}]

        await ActivityContactRecord.updateMany({activityID: activityID,
                                                activityType: 'Texting',
                                                'textbankContactDetails.residentPhonenumber': {$in: digits},
                                                $or: noPersonID},
                                               {$set: {personID: personID, person: membership.toObject()}})

        await TextRecord.updateMany({phone: {$in: digits}, $or: noPersonID}, {$set: {personID: personID}})
    } catch(e){
        console.log(e)
    }
}

module.exports = {submitPetitionSurveyResponse}
