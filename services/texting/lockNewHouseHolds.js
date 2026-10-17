var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

const lockNewHouseHolds = async(detail) => {
    try { 

        var tbHouseHoldRecords = await ActivityHouseholdRecord.aggregate([
            {$match: {
                activityID: detail.activityID,
                locked: false,
                passed: false,
            }},
        ]).allowDiskUse(true).sample(50)

        for(var i = 0; i < tbHouseHoldRecords.length; i++){
            await ActivityHouseholdRecord.updateOne({_id: tbHouseHoldRecords[i]._id}, 
                                                    {$set: {lockedBy: detail.userID,
                                                            locked:true,

            }})
        }

        return tbHouseHoldRecords

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {lockNewHouseHolds}
