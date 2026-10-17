var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

const loadHouseHolds = async(detail) => {
    try {
        return await ActivityHouseholdRecord.find({lockedBy: detail.userID, 
                                                    locked: true,
                                                   activityID: detail.activityID,
                                                   passed: false,
                                                   complete: false,
                                                                    })
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {loadHouseHolds}
