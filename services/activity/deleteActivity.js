var Activity = require('../../models/activities/activity')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

const deleteActivity = async(details) => {
    try { 
        await ActivityHouseholdRecord.deleteMany({activityID: details.activityID})
        return await Activity.deleteOne({_id: details.activityID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteActivity}