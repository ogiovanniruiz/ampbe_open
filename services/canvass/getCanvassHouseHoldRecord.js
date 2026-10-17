var ActivityHouseholdrecord = require('../../models/activities/activityHouseholdRecord')

const getCanvassHouseHoldRecord = async(details) => {
    try { 
        return await ActivityHouseholdrecord.aggregate([
            {$match: 
                    {
                      activityID: details.activityID, 
                     'houseHold._id.streetNum': details.houseHoldID.streetNum, 
                     'houseHold._id.street': details.houseHoldID.street
                     
                    }
            },
            {$group: {_id: {location:'$houseHold.location'},
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

module.exports = {getCanvassHouseHoldRecord}