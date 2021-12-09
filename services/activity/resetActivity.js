var Activity = require('../../models/activities/activity')
var PhonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')
var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')
var CanvassHouseHoldRecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const resetActivity = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)

        if(activity.activityType === "Texting"){

            var textbankHouseHoldRecord = await TextbankHouseHoldRecord.find({activityID: details.activityID, textReceived: false});

            for(var i = 0; i < textbankHouseHoldRecord.length; i++ ){
                textbankHouseHoldRecord[i].lockedBy = undefined;
                textbankHouseHoldRecord[i].initTextSent = false;
                textbankHouseHoldRecord[i].save()
            }

        }
        
        if(activity.activityType === "Phonebank"){

            var phonebankHouseHoldRecord = await PhonebankHouseHoldRecord.find({activityID: details.activityID, complete: false})

            for(var i = 0; i < phonebankHouseHoldRecord.length; i++ ){
                phonebankHouseHoldRecord[i].passed = false;
                phonebankHouseHoldRecord[i].lockedBy = undefined;
                phonebankHouseHoldRecord[i].numResContacted = 0;
                phonebankHouseHoldRecord[i].save()
            }
        }

        if(activity.activityType === "Canvass"){

            var canvassHouseHoldRecord = await CanvassHouseHoldRecord.find({activityID: details.activityID, complete: false})

            for(var i = 0; i < canvassHouseHoldRecord.length; i++ ){
                canvassHouseHoldRecord[i].passed = false;
                canvassHouseHoldRecord[i].numResContacted = 0;
                canvassHouseHoldRecord[i].save()
            }
        }

        activity.passes = activity.passes + 1

        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {resetActivity}
