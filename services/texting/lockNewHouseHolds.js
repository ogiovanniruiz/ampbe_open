var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

// Households one texter locks per "load more"
const BATCH_SIZE = 200

const lockNewHouseHolds = async(detail) => {
    try {

        var tbHouseHoldRecords = await ActivityHouseholdRecord.aggregate([
            {$match: {
                activityID: detail.activityID,
                locked: false,
                passed: false,
            }},
        ]).allowDiskUse(true).sample(BATCH_SIZE)

        var ids = tbHouseHoldRecords.map(record => record._id)

        // One write for the batch; a household another texter locked meanwhile is left to them
        await ActivityHouseholdRecord.updateMany({_id: {$in: ids}, locked: false},
                                                 {$set: {lockedBy: detail.userID,
                                                         locked: true,
        }})

        return await ActivityHouseholdRecord.find({_id: {$in: ids}, lockedBy: detail.userID}).lean()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {lockNewHouseHolds}
