var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var ActivityContactRecord = require('../../models/activities/activityContactRecord')

// Resets a finished door: deletes its contact records for this activity and marks it not complete/not passed.
// details.householdID is the activity household record's _id.
const editCanvassContactRecord= async(details) => {
    try {

        // Look the door up first, so nothing is deleted for a record that doesn't exist
        var activityHouseholdRecord = await ActivityHouseholdRecord.findOne({activityID: details.activityID, _id: details.householdID});
        if(!activityHouseholdRecord){
            return {success: false, msg: "This door couldn't be found. Refresh the map and try again."}
        }

        await ActivityContactRecord.deleteMany({activityID: details.activityID, activityHouseholdRecordID: details.householdID})

        activityHouseholdRecord.complete = false
        activityHouseholdRecord.passed = false

        return await activityHouseholdRecord.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editCanvassContactRecord}
