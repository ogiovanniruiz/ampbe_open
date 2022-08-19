var Activity = require('../../models/activities/activity')
var phonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord')
var textbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')
var canvassHouseHoldRecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const getActivitySize = async(detail) => {
    try { 
        var activity = await Activity.findById(detail.activityID)

        var totalResidents = 0

        if(activity.activityType ==='Phonebank'){
            var pbhhrecords = await phonebankHouseHoldRecord.count({activityID: detail.activityID})

            /*
            for(var i = 0; i < pbhhrecords.length; i++){
                totalResidents = totalResidents + pbhhrecords[i].houseHold.residents.length
            }*/

            return {totalHouseHolds: pbhhrecords}
        }

        if(activity.activityType ==='Texting'){
            var tbhhrecords = await textbankHouseHoldRecord.count({activityID: detail.activityID})

            /*
            for(var i = 0; i < tbhhrecords.length; i++){
                totalResidents = totalResidents + tbhhrecords[i].houseHold.residents.length
            }*/

            return {totalHouseHolds: tbhhrecords}
        }

        if(activity.activityType ==='Canvass'){
            var chhrecords = await canvassHouseHoldRecord.count({activityID: detail.activityID})

            /*
            for(var i = 0; i < chhrecords.length; i++){
                totalResidents = totalResidents + chhrecords[i].houseHold.residents.length
            }*/

            return {totalHouseHolds: chhrecords}
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivitySize}