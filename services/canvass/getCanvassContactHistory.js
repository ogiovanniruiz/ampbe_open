var CanvassContactHistory = require('../../models/activities/canvass/canvassContactHistory')

const getCanvassContactHistory = async(details) => {
    try { 

        return await CanvassContactHistory.find({activityID: details.activityID, 
                                                        'person.address.streetNum': details.houseHoldID.streetNum, 
                                                        'person.address.street': details.houseHoldID.street})
                                                                              
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassContactHistory}