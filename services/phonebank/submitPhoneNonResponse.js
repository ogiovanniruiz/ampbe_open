var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var lockHousehold = require('./lockHousehold')
var Activity = require('../../models/activities/activity')
var {contactRecordForResponse} = require('./contactRecordForResponse')
var {currentPass} = require('./currentPass')

const submitPhoneNonResponse = async(nonResponseData) => {
    try {

        // Recorded on the activity's pass, not the one the page loaded with
        nonResponseData.passes = await currentPass({activityHouseholdRecordID: nonResponseData.activityHouseholdRecordID, fallback: nonResponseData.passes})

        // A retry of a saved non-response moves on; a call that never got linked still gets it recorded
        var wanted = nonResponseData.nonResponseObject || {}
        var found = await contactRecordForResponse(nonResponseData, (record) => !!record.nonResponse && record.nonResponse.nonResponse === wanted.nonResponse)
        if(found.error) return {error: found.error}
        var activityContactRecord = found.record

        if(!found.alreadySaved){
            activityContactRecord.nonResponse = nonResponseData.nonResponseObject
            if(wanted.nonResponseType == "DNC" || wanted.nonResponseType === "INVALIDPHONE" ||  wanted.nonResponseType === "INVALIDADDRESS"){
                activityContactRecord.complete = true
            }
            await activityContactRecord.save()
        }

        var aHHRecord = await ActivityHouseholdRecord.findOne({_id: activityContactRecord.activityHouseholdRecordID});

        var activity = await Activity.findOne({_id: activityContactRecord.activityID})
        if(!aHHRecord || !activity) return {error: 'This household is no longer available. Skip it to continue.'}

        // The next household is for whoever is submitting (a retried record may carry another caller's ID)
        var nextFor = {activityID: activityContactRecord.activityID, userID: nonResponseData.userID || activityContactRecord.userID}

        // Only a survey response closes a household-ID'd household; a non-response is counted like any other,
        // so the rest of the household is still called this pass and the household is passed when everyone is
        var hhPersonIDs = aHHRecord.household.residents.map(x=> {return x.personID})

        var numResContacted = await ActivityContactRecord.countDocuments({activityID: activity._id,
                                                                          complete: true,
                                                                          'person.resident.personID': {$in: hhPersonIDs},
                                                                           
                                                                           })

        if(numResContacted >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.complete = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            await aHHRecord.save()
            return lockHousehold.lockHousehold(nextFor)
        }

        var numResNonresponded = await ActivityContactRecord.countDocuments({activityID: activity._id,
                                                                            pass: nonResponseData.passes,
                                                                            nonResponse: {$exists: true},
                                                                            complete: false,
                                                                            'person.resident.personID': {$in: hhPersonIDs},
                                                                            })
        
        if((numResNonresponded + numResContacted) >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            await aHHRecord.save()
            return lockHousehold.lockHousehold(nextFor)
        }
        
        await aHHRecord.save()
        return lockHousehold.lockHousehold(nextFor)

    } catch(e){
        console.log('submitPhoneNonResponse failed:', e.message, {activityHouseholdRecordID: nonResponseData && nonResponseData.activityHouseholdRecordID, personID: nonResponseData && nonResponseData.resident && nonResponseData.resident.personID, pass: nonResponseData && nonResponseData.passes})
        throw new Error(e.message)
    }
}

module.exports = {submitPhoneNonResponse}