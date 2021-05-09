var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const loadHouseHolds = async(detail) => {
    try {
        var lockedHouseHoldRecords = await TextbankHouseHoldRecord.find({lockedBy: detail.userID, 
                                                                     activityID: detail.activityID,
                                                                     initTextSent: false,
                                                                     textReceived: false,
                                                                    })

        var sentHouseHoldRecords = await TextbankHouseHoldRecord.find({lockedBy: detail.userID, 
                                                                         activityID: detail.activityID,
                                                                         initTextSent: true,
                                                                         textReceived: false,
                                                                       })                                                               
        
        return {success: true, lockedHouseHoldRecords: lockedHouseHoldRecords, sentHouseHoldRecords: sentHouseHoldRecords, msg: "Success"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {loadHouseHolds}
