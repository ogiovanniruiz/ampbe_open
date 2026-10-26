var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const getCanvassContactHistory = async(details) => {
    try { 
        // Every canvass contact record stores its household record ID, which is exact
        if(details.activityHouseholdRecordID){
            return await ActivityContactRecord.find({activityID: details.activityID,
                                                     activityHouseholdRecordID: details.activityHouseholdRecordID})
        }

        // Older clients only send the address, which can match other households
        // with the same number and street (different prefix or city)
        return await ActivityContactRecord.find({activityID: details.activityID, 
                                                 'person.address.streetNum': details.householdID.streetNum, 
                                                 'person.address.street': details.householdID.street,
                                                'person.address.unit': details.householdID.unit
                                                })
                                                                              
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassContactHistory}
