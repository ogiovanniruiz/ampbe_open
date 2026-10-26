var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var Activity = require('../../models/activities/activity')

// A person's survey response is saved once per canvass. Double taps and canvassers working in pairs
// used to save it again, which inflated contacts and closed households before everyone was surveyed.
const surveyAlreadySaved = (record) => !!record.surveyResponse && !!record.personID &&
    ActivityContactRecord.exists({activityID: record.activityID, personID: record.personID, activityType: 'Canvass', surveyResponse: {$exists: true}})

const createCanvassContactRecord = async(activityContactRecord) => {
    try {
        if(!(await surveyAlreadySaved(activityContactRecord))){
            try {
                var newActivityContactRecord = new ActivityContactRecord(activityContactRecord)
                await newActivityContactRecord.save()
            } catch(e){
                // Another submit for this person won the race (canvass_one_survey_per_person index); theirs stands
                if(e.code !== 11000) throw e
            }
        }

        var aHHRecord = await ActivityHouseholdRecord.findOne({_id: activityContactRecord.activityHouseholdRecordID});

        var activity = await Activity.findOne({_id: activityContactRecord.activityID})

        // A household-ID'd household is done once anyone in it is surveyed; a non-response is counted per person below
        if(activity.idBy === 'HOUSEHOLD' && activityContactRecord.surveyResponse){

            aHHRecord.passed = true;
            aHHRecord.complete = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1

            return await aHHRecord.save()
        }

        var hhPersonIDs = aHHRecord.household.residents.map(x=> {return x.personID})

        // People, not records: a person saved twice must not stand in for a housemate
        var contacted = await ActivityContactRecord.distinct('person.resident.personID', {'person.resident.personID': {$in: hhPersonIDs},
                                                                                         complete: true,
                                                                                         activityID: activity._id})
        var numResContacted = contacted.length

        if(numResContacted >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.complete = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            return await aHHRecord.save()
        }


        // Only this pass's non-responses count; earlier passes were already handled
        var nonresponded = await ActivityContactRecord.distinct('person.resident.personID', {'person.resident.personID': {$in: hhPersonIDs, $nin: contacted},
                                                                                            nonResponse: {$exists: true},
                                                                                            complete: false,
                                                                                            pass: activityContactRecord.pass,
                                                                                            activityID: activity._id})
        var numResNonresponded = nonresponded.length


        if((numResNonresponded + numResContacted) >= hhPersonIDs.length){
            aHHRecord.passed = true;
            aHHRecord.timesContacted = aHHRecord.timesContacted + 1
            return await aHHRecord.save()
        }

        return await aHHRecord.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createCanvassContactRecord}
