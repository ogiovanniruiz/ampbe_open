var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

// The activity's pass as the database has it. Calling pages load the activity once, so the pass they
// send is stale after a reset; calls and responses are recorded on this one instead.
// Falls back to the page's pass when the activity can't be found.
const currentPass = async({activityID, activityHouseholdRecordID, fallback}) => {
    if(!activityID && activityHouseholdRecordID){
        var aHHRecord = await ActivityHouseholdRecord.findById(activityHouseholdRecordID, {activityID: 1}).lean().catch(() => null)
        activityID = aHHRecord && aHHRecord.activityID
    }
    var activity = activityID ? await Activity.findById(activityID, {passes: 1}).lean().catch(() => null) : null
    return activity ? (activity.passes || 0) : fallback
}

module.exports = {currentPass}
