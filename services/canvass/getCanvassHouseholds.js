var Activity = require('../../models/activities/activity')
var Canvasshouseholdrecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const getCanvassHouseholds = async(details) => {
    try { 

        return await Canvasshouseholdrecord.aggregate([
            {$match: {activityID: details.activityID}},
            {$group: {_id: {location:'$houseHold.location', 
                            //primary_zip: '$houseHold.primary_zip'
                        },
                        records: {$push: '$$ROOT'},
                        complete: {$push: '$complete'},
                        passed: {$push: '$passed'}
                        }
            }
        
        ]).allowDiskUse(true)

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassHouseholds}