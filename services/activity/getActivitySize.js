var Activity = require('../../models/activities/activity')
var phonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')
var textbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const getActivitySize = async(detail) => {
    try { 
        var activity = await Activity.findById(detail.activityID)

        if(activity.activityType ==='Phonebank'){
            var pbhhrecords = await phonebankHouseHoldRecord.countDocuments({activityID: detail.activityID})
            return {totalHouseHolds: pbhhrecords}
        }

        if(activity.activityType ==='Texting'){
            var tbhhrecords = await textbankHouseHoldRecord.countDocuments({activityID: detail.activityID})
            return {totalHouseHolds: tbhhrecords}
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivitySize}