var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var lockHousehold = require('./lockHousehold')
var Activity = require('../../models/activities/activity')
var {contactRecordForResponse} = require('./contactRecordForResponse')
var {currentPass} = require('./currentPass')

const submitPhoneSurveyResponse = async(surveyResponseData) => {
    
    try {

        // Recorded on the activity's pass, not the one the page loaded with
        surveyResponseData.passes = await currentPass({activityHouseholdRecordID: surveyResponseData.activityHouseholdRecordID, fallback: surveyResponseData.passes})

        // A retry of a saved response moves on; a call that never got linked still gets its response recorded
        var found = await contactRecordForResponse(surveyResponseData, (record) => record.complete && !!record.surveyResponse, {savedFirst: true})
        if(found.error) return {error: found.error}
        var activityContactRecord = found.record

        if(!found.alreadySaved){
            activityContactRecord.surveyResponse = surveyResponseData.surveyResponse
            activityContactRecord.complete = true
            await activityContactRecord.save()
        }

        var aHHRecord = await ActivityHouseholdRecord.findOne({_id: activityContactRecord.activityHouseholdRecordID});

        var activity = await Activity.findOne({_id: activityContactRecord.activityID})
        if(!aHHRecord || !activity) return {error: 'This household is no longer available. Skip it to continue.'}

        // The next household is for whoever is submitting (a retried record may carry another caller's ID)
        var nextFor = {activityID: activityContactRecord.activityID, userID: surveyResponseData.userID || activityContactRecord.userID}

        if(activity.idBy === 'HOUSEHOLD'){
            aHHRecord.passed = true;
            aHHRecord.complete = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            await aHHRecord.save()
            return lockHousehold.lockHousehold(nextFor)
        }

        var hhPersonIDs = aHHRecord.household.residents.map(x=> {return x.personID})

        var numResContacted = await ActivityContactRecord.countDocuments({'person.resident.personID': {$in: hhPersonIDs},
                                                                           complete: true,
                                                                           activityID: activity._id})

        if(numResContacted >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.complete = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            await aHHRecord.save()
            return lockHousehold.lockHousehold(nextFor)
        }

        var numResNonresponded = await ActivityContactRecord.countDocuments({'person.resident.personID': {$in: hhPersonIDs},
                                                                            nonResponse: {$exists: true},
                                                                            pass: surveyResponseData.passes,
                                                                            complete: false,
                                                                            activityID: activity._id})
        
        if((numResNonresponded + numResContacted) >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            await aHHRecord.save()
            return lockHousehold.lockHousehold(nextFor)
        }
        
        await aHHRecord.save()
        return lockHousehold.lockHousehold(nextFor)

    
    } catch(e){
        console.log('submitPhoneSurveyResponse failed:', e.message, {activityHouseholdRecordID: surveyResponseData && surveyResponseData.activityHouseholdRecordID, personID: surveyResponseData && surveyResponseData.resident && surveyResponseData.resident.personID, pass: surveyResponseData && surveyResponseData.passes})
        throw new Error(e.message)
    }
}

module.exports = {submitPhoneSurveyResponse}
