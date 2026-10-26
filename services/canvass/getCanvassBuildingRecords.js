var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var Activity = require('../../models/activities/activity')

const getCanvassBuildingRecords = async(details) => {
    try { 
        // A deactivated canvass hands out no more households
        var activity = await Activity.findById(details.activityID, {active: 1})
        if(!activity || activity.active === false){
            return {inactive: true}
        }


        return await ActivityHouseholdRecord.aggregate([
            {$match: {activityID: details.activityID}},
            {$group: {_id: {location:'$household.location'},
                        records: {$push: '$$ROOT'},
                        complete: {$push: '$complete'},
                        passed: {$push: '$passed'}
                        }
            },
            { $sort : { 'records.0.household._id.street' : 1 } }
        
        ]).allowDiskUse(true)

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassBuildingRecords}