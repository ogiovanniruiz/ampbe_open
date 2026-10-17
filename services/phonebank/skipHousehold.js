var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')

const skipHousehold = async(data) => {
    try {
        var pbHouseHoldRecord = await ActivityHouseholdRecord.findById(data.pbHHRecordID)
        pbHouseHoldRecord.passed = true
        return pbHouseHoldRecord.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {skipHousehold}
