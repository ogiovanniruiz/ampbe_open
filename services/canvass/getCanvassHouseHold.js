var Activity = require('../../models/activities/activity')
var Canvasshouseholdrecord = require('../../models/activities/canvass/canvassHouseHoldRecord')
var CanvassContactHistory = require('../../models/activities/canvass/canvassContactHistory')

const getCanvassHouseHold = async(details) => {
    try { 
        var cHHRecord = await Canvasshouseholdrecord.aggregate([
            {$match: {activityID: details.activityID, 
                'houseHold._id.streetNum': details.houseHoldID.streetNum, 'houseHold._id.street': details.houseHoldID.street}},
            
            {$group: {_id: {
                            location:'$houseHold.location',
                            },
                        houseHold: {$first: '$houseHold'},
                        records: {$push: '$$ROOT'},
                        complete: {$push: '$complete'}

                        }
            }
        
        ]).allowDiskUse(true)//await Canvasshouseholdrecord.findOne({activityID: details.activityID, 'houseHold._id.streetNum': details.houseHoldID.streetNum })



        var ccHistory = await CanvassContactHistory.find({activityID: details.activityID, 
            'person.address.streetNum': details.houseHoldID.streetNum, 'person.address.street': details.houseHoldID.street})

        return {cHHRecord, ccHistory}
                                                                                  
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassHouseHold}