var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')

const loadHouseHolds = async(detail) => {
    try {
        var lockedHouseHoldRecords = await TextbankHouseHoldRecord.find({lockedBy: detail.userID, 
                                                                     activityID: detail.activityID,
                                                                     initTextSent: false,
                                                                     textReceived: false,
                                                                    })

        return {success: true, lockedHouseHoldRecords: lockedHouseHoldRecords, msg: "Success"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {loadHouseHolds}
