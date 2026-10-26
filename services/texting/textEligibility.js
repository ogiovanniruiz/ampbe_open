var ActivityContactRecord = require('../../models/activities/activityContactRecord')

// Filter for contact records that mean "don't send this person another initial text":
// they replied, or have a final result (survey response, DNC, wrong number...)
const FINISHED_FILTER = {
    $or: [
        {complete: true},
        {'textbankContactDetails.textReceived.status': true},
    ]
}

/**
 * personIDs in this textbank who already replied or were finished in any pass.
 * Pass personIDs to only check those people.
 */
const getFinishedTextPersonIDs = async(activityID, personIDs) => {
    const match = {activityID: String(activityID), ...FINISHED_FILTER}
    if(personIDs) match.personID = {$in: personIDs}
    return ActivityContactRecord.distinct('personID', match)
}

module.exports = {getFinishedTextPersonIDs, FINISHED_FILTER}
