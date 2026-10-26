var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

/**
 * The contact record a phonebank response is written to.
 *   {record}                     the call's unanswered record (the normal case)
 *   {record, alreadySaved: true} this response was saved before (a retry); don't write it again
 *   {record, created: true}      the call never got linked to the resident, so the record is made here
 *   {error}                      the household is gone; nothing can be recorded
 *
 * isSaved(record) says whether an existing record already holds this response.
 * savedFirst: look for an already-saved response before any open record (survey responses are
 * recorded once per person per pass, so a repeat Submit must not land on another open record).
 */
const contactRecordForResponse = async(data, isSaved, options = {}) => {
    var personID = data.resident && data.resident.personID
    // Call records only: a reply texted to the calling number creates a Texting record for the same
    // household, person and pass, and responses must never be written onto it
    var base = {activityHouseholdRecordID: data.activityHouseholdRecordID, personID: personID, pass: data.passes, activityType: 'Phonebank'}

    if(options.savedFirst){
        var earlier = await ActivityContactRecord.find(base).sort({creationDate: -1})
        var alreadySaved = earlier.find(isSaved)
        if(alreadySaved) return {record: alreadySaved, alreadySaved: true}
    }

    // The latest call, not an older one (e.g. an earlier "Not Home" call in the same pass)
    var record = await ActivityContactRecord.findOne({...base, complete: false}).sort({creationDate: -1})
    if(record) return {record}

    if(!options.savedFirst){
        var previous = await ActivityContactRecord.find(base).sort({creationDate: -1})
        var saved = previous.find(isSaved)
        if(saved) return {record: saved, alreadySaved: true}
    }

    var aHHRecord = await ActivityHouseholdRecord.findOne({_id: data.activityHouseholdRecordID})
    if(!aHHRecord || !aHHRecord.household) return {error: 'This household is no longer available. Skip it to continue.'}

    var household = aHHRecord.household
    var resident = (household.residents || []).find(r => r.personID === personID) || data.resident

    // Same person details finishCall records for a linked call
    var newRecord = new ActivityContactRecord({
        activityType: 'Phonebank',
        activityID: aHHRecord.activityID,
        activityHouseholdRecordID: data.activityHouseholdRecordID,
        orgID: data.orgID,
        campaignID: data.campaignID,
        userID: data.userID,
        personID: personID,
        pass: data.passes,
        person: {
            resident: resident,
            address: household._id,
            county: household.county,
            fullAddress1: household.fullAddress1,
            fullAddress2: household.fullAddress2,
            location: household.location,
            accuracyType: household.accuracyType,
            districts: household.districts,
            registrationPrecinctID: household.registrationPrecinctID
        },
    })

    console.log('Phonebank response recorded without a linked call:', {activityHouseholdRecordID: data.activityHouseholdRecordID, personID, pass: data.passes, userID: data.userID})
    return {record: newRecord, created: true}
}

module.exports = {contactRecordForResponse}
