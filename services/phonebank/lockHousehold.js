var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord');
var ActivityContactRecord = require('../../models/activities/activityContactRecord');
var Activity = require('../../models/activities/activity');
var Campaign = require('../../models/campaigns/campaign');

// Households screened per draw; finished ones are completed as they're found, so the pool always shrinks
const BATCH = 25

// People a phonebank shouldn't call: anyone who answered this activity's survey anywhere in the campaign,
// plus Do Not Contact and wrong numbers recorded since the call list was built.
// Same scopes as the exclusions applied when the list is built (contactExclusions / generateGroupResults).
const blockedPersonIDs = async(activity, campaign, personIDs) => {
    var surveyed = new Set(), unreachable = new Set()
    if(!personIDs.length) return {surveyed, unreachable}

    var or = [
        {'nonResponse.nonResponseType': 'DNC', $or: [{campaignID: activity.campaignID}, {orgID: {$in: (campaign && campaign.orgIDs) || []}}]},
        {'nonResponse.nonResponseType': 'INVALIDPHONE', orgID: activity.orgIDs[0]},
    ]
    if(activity.surveyID) or.push({campaignID: activity.campaignID, 'surveyResponse.surveyID': activity.surveyID})

    var records = await ActivityContactRecord.find({personID: {$in: personIDs}, $or: or},
                                                   {personID: 1, 'surveyResponse.surveyID': 1, 'nonResponse.nonResponseType': 1}).lean()

    for(var record of records){
        var type = record.nonResponse && record.nonResponse.nonResponseType
        if(type === 'DNC' || type === 'INVALIDPHONE') unreachable.add(String(record.personID))
        else if(record.surveyResponse) surveyed.add(String(record.personID))
    }
    return {surveyed, unreachable}
}

const residentsOf = (record) => (record.household && record.household.residents) || []

// Drops residents the phonebank shouldn't call from each household (one lookup for the whole batch).
// Households with nobody left are completed; trimmed ones are saved. Returns the households still worth calling.
const screenHouseholds = async(records, activity, campaign) => {
    var personIDs = [...new Set(records.flatMap(r => residentsOf(r).map(res => res.personID).filter(Boolean).map(String)))]
    var {surveyed, unreachable} = await blockedPersonIDs(activity, campaign, personIDs)
    var callable = [], done = [], trimmed = []

    for(var record of records){
        var residents = residentsOf(record)

        // A household-ID'd phonebank is done with a household once anyone in it answers the survey
        var householdDone = activity.idBy === 'HOUSEHOLD' && residents.some(r => surveyed.has(String(r.personID)))
        var remaining = householdDone ? [] : residents.filter(r => !surveyed.has(String(r.personID)) && !unreachable.has(String(r.personID)))

        if(!remaining.length){
            done.push(record._id)
            continue
        }
        if(remaining.length < residents.length){
            record.household.residents = remaining
            trimmed.push({updateOne: {filter: {_id: record._id}, update: {$set: {'household.residents': remaining}}}})
        }
        callable.push(record)
    }

    if(done.length) await ActivityHouseholdRecord.updateMany({_id: {$in: done}}, {$set: {complete: true, passed: true, locked: false}, $unset: {lockedBy: 1}})
    if(trimmed.length) await ActivityHouseholdRecord.bulkWrite(trimmed, {ordered: false})
    return callable
}

// Pages load the activity once, so every household handed out carries the activity's pass:
// a page opened before a reset picks up the new pass on its next household
const withCurrentPass = (record, activity) => {
    var plain = typeof record.toObject === 'function' ? record.toObject() : record
    return {...plain, currentPass: activity.passes || 0}
}

const lockHousehold = async(detail) => {
    try {
        // A deactivated activity hands out no more households
        var activity = await Activity.findById(detail.activityID, {active: 1, activityType: 1, surveyID: 1, campaignID: 1, orgIDs: 1, idBy: 1, passes: 1}).lean()
        if(!activity || activity.active === false){
            return {inactive: true}
        }

        // Phonebanks skip people surveyed, marked DNC or found to have a wrong number since the list was built
        var screen = activity.activityType === 'Phonebank'
        var campaign = screen ? await Campaign.findOne({campaignID: activity.campaignID}, {orgIDs: 1}).lean() : null

        var aHHRecord = await ActivityHouseholdRecord.findOne({
            'activityID': detail.activityID,
            'lockedBy': detail.userID,
            'passed': false,
            'complete': false,
            'locked': true,
        });

        // The caller's own household, unless someone else has since surveyed or ruled them out
        if(aHHRecord && (!screen || (await screenHouseholds([aHHRecord], activity, campaign)).length)){
            return withCurrentPass(aHHRecord, activity)
        }

        // Every screened-out household is completed, so this ends once someone is callable or none are left
        while(true){
            var sampled = await ActivityHouseholdRecord.aggregate([
                {$match: {
                    'activityID': detail.activityID,
                    'locked': false,
                    'passed': false,
                    'complete': false
                }},
                {$set: {lockedBy: detail.userID, locked: true}}

            ]).allowDiskUse(true).sample(screen ? BATCH : 1)

            if(!sampled.length) return false

            // Screen before locking so a finished household is never left locked
            var callable = screen ? await screenHouseholds(sampled, activity, campaign) : sampled
            if(!callable.length) continue

            await ActivityHouseholdRecord.updateOne({_id: callable[0]._id}, {$set: {lockedBy: detail.userID,  locked: true}})
            return withCurrentPass(callable[0], activity)
        }

    } catch(e){

        throw new Error(e.message)

    }
}

module.exports = {lockHousehold}
