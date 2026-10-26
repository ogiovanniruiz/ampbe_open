
var generateGroupResults = require('../group/generateGroupResults')

var Household = require('../../models/households/household')
var People = require('../../models/people/people')
var Membership = require('../../models/people/membership')

var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

const generateActivityHHRecords = async(newActivity) => {

    var query = await generateGroupResults.generateGroupResults(newActivity)

    query['agg'].push({'$merge': { into: "activityhouseholdrecords", on: "_id", whenNotMatched: "insert" }})

    if(query.groupBy === 'HOUSEHOLD'){
        await Household.aggregate(query['agg']).allowDiskUse(true)
    }
    if (query.groupBy === 'INDIVIDUAL'){
        await People.aggregate(query['agg']).allowDiskUse(true)
    }
    if(query.groupBy === 'MEMBERSHIP') {
        await Membership.aggregate(query['agg']).allowDiskUse(true)
    }

    // Reaching the cap means the group had more households than the activity got
    var count = await ActivityHouseholdRecord.countDocuments({activityID: newActivity._id.toString()})
    var hhCapped = count >= generateGroupResults.MAX_ACTIVITY_HOUSEHOLDS

    await Activity.updateOne({_id: newActivity._id},{$set: {hhReady: true, hhCapped: hhCapped}})

}


module.exports = {generateActivityHHRecords}