var Activity = require('../../models/activities/activity')
var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var PhonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')
var CanvassHouseHoldRecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const deleteActivity = async(details) => {
    try { 
        if(details.activityType === 'Texting'){

            await TextbankContactHistory.deleteMany({activityID: details.activityID})
            await TextbankHouseHoldRecord.deleteMany({activityID: details.activityID})
        }

        if(details.activityType === 'Phonebank'){

            await PhonebankContactHistory.deleteMany({activityID: details.activityID})
            await PhonebankHouseHoldRecord.deleteMany({activityID: details.activityID})
        }

        if(details.activityType === 'Canvass'){

            //await CanvassContactHistory.deleteMany({activityID: details.activityID})
            await CanvassHouseHoldRecord.deleteMany({activityID: details.activityID})
        }

        return await Activity.deleteOne({_id: details.activityID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteActivity}