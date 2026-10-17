var mongoose = require('mongoose')
var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var { FINISHED_FILTER } = require('../texting/textEligibility')

// Textbank households where every resident replied or was finished: a new pass
// has nobody left to text there, so they stay passed
const getFinishedTextHouseholdIDs = async(activityID) => {
    var finishedByHousehold = await ActivityContactRecord.aggregate([
        {$match: {activityID: activityID, ...FINISHED_FILTER}},
        {$group: {_id: '$activityHouseholdRecordID', personIDs: {$addToSet: '$personID'}}}
    ]).allowDiskUse(true)

    var finishedMap = new Map(finishedByHousehold.map(x => [String(x._id), new Set(x.personIDs)]))
    if(finishedMap.size === 0) return []

    var candidates = await ActivityHouseholdRecord.find(
        {activityID: activityID, complete: false, passed: true, _id: {$in: [...finishedMap.keys()].filter(id => mongoose.Types.ObjectId.isValid(id))}},
        {'household.residents.personID': 1}
    ).lean()

    return candidates
        .filter(hh => {
            var finished = finishedMap.get(String(hh._id))
            var residents = hh.household?.residents || []
            return residents.length > 0 && residents.every(r => finished.has(r.personID))
        })
        .map(hh => hh._id)
}

const resetActivity = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)

        // Households whose most recent contact was "Inaccessible" stay passed
        var inaccessibleHHs = await ActivityContactRecord.aggregate([
            {$match: {activityID: details.activityID}},
            {$sort: {creationDate: -1}},
            {$group: {_id: '$activityHouseholdRecordID', last: {$first: '$nonResponse.nonResponse'}}},
            {$match: {last: 'Inaccessible'}}
        ])

        var inaccessibleIDs = inaccessibleHHs.filter(x => mongoose.Types.ObjectId.isValid(x._id)).map(x => new mongoose.Types.ObjectId(x._id))

        var keepPassedIDs = inaccessibleIDs
        if(activity.activityType === 'Texting'){
            keepPassedIDs = keepPassedIDs.concat(await getFinishedTextHouseholdIDs(details.activityID))
        }

        await ActivityHouseholdRecord.updateMany(
            {activityID: details.activityID, complete: false, passed: true, _id: {$nin: keepPassedIDs}}, 
            { $set: {locked: false, passed: false}}
        );

        activity.passes = activity.passes + 1

        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {resetActivity}
