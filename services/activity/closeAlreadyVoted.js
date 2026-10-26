var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var People = require('../../models/people/people')

// Household records screened per people2026b lookup
const CHUNK = 1000

// Petitions don't contact anyone from a list
const CONTACT_TYPES = ['Phonebank', 'Canvass', 'Texting']

// Removes voters who already voted (resident.voted_current_cycle) from the households of open activities.
// A household where everyone voted is closed the way the phonebank closes finished ones, never deleted,
// so report counts stay the same and a new pass doesn't reopen it. Residents not found in people2026b
// (members) are kept. With apply false nothing is written and only the counts come back.
// onProgress(done, total) is called as each activity finishes.
const closeAlreadyVoted = async({campaignID, activityIDs, apply, onProgress}) => {
    var query = {activityType: {$in: CONTACT_TYPES}}
    if(activityIDs) query._id = {$in: activityIDs}
    else Object.assign(query, {campaignID: campaignID, active: {$ne: false}})

    var activities = await Activity.find(query, {name: 1, activityType: 1}).lean()

    // residentsRemoved: taken out of households that stay open (the drop in the activity's resident count).
    // votersInClosed: listed in households where everyone voted; those stay listed but the household is done.
    var result = {activities: activities.length, residentsRemoved: 0, householdsClosed: 0, votersInClosed: 0, perActivity: []}
    var done = 0
    if(onProgress) onProgress(done, activities.length)

    for(var activity of activities){
        var counts = {activityID: String(activity._id), name: activity.name, activityType: activity.activityType, residentsRemoved: 0, householdsClosed: 0, votersInClosed: 0}
        var cursor = ActivityHouseholdRecord.find({activityID: String(activity._id), complete: false}, {'household.residents': 1}).lean().cursor()

        var chunk = []
        var flush = async() => {
            if(!chunk.length) return
            await screenChunk(chunk, counts, apply)
            chunk = []
        }

        for(var record = await cursor.next(); record != null; record = await cursor.next()){
            chunk.push(record)
            if(chunk.length >= CHUNK) await flush()
        }
        await flush()

        result.residentsRemoved += counts.residentsRemoved
        result.householdsClosed += counts.householdsClosed
        result.votersInClosed += counts.votersInClosed
        if(counts.residentsRemoved || counts.householdsClosed) result.perActivity.push(counts)
        if(onProgress) onProgress(++done, activities.length)
    }

    return result
}

const residentsOf = (record) => (record.household && record.household.residents) || []

const screenChunk = async(records, counts, apply) => {
    var personIDs = [...new Set(records.flatMap(r => residentsOf(r).map(res => res.personID).filter(Boolean).map(String)))]
    var votedPeople = personIDs.length
        ? await People.find({'resident.personID': {$in: personIDs}, 'resident.voted_current_cycle': true}, {'resident.personID': 1}).lean()
        : []
    var voted = new Set(votedPeople.map(p => String(p.resident.personID)))

    var writes = []
    for(var record of records){
        var residents = residentsOf(record)
        var remaining = residents.filter(r => !(r.voted_current_cycle === true || voted.has(String(r.personID))))
        if(remaining.length === residents.length) continue

        if(!remaining.length){
            counts.householdsClosed++
            counts.votersInClosed += residents.length
            writes.push({updateOne: {filter: {_id: record._id}, update: {$set: {complete: true, passed: true, locked: false}, $unset: {lockedBy: 1}}}})
        }else{
            counts.residentsRemoved += residents.length - remaining.length
            writes.push({updateOne: {filter: {_id: record._id}, update: {$set: {'household.residents': remaining}}}})
        }
    }

    if(apply && writes.length) await ActivityHouseholdRecord.bulkWrite(writes, {ordered: false})
}

module.exports = {closeAlreadyVoted}
