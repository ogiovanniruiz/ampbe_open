var Activity = require('../../models/activities/activity')
var Canvasshouseholdrecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const getCanvassHouseholds = async(details) => {
    try { 

        return await Canvasshouseholdrecord.aggregate([
            {$match: {activityID: details.activityID}},
            
            {$group: {_id: {
                            location:'$houseHold.location',
                            },
                        houseHold: {$first: '$houseHold'},
                        records: {$push: '$$ROOT'},
                        complete: {$push: '$complete'}

                        }
            }
        
        ]).allowDiskUse(true)

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassHouseholds}