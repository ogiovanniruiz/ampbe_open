var TextbankHouseHoldRecord = require('../../models/activities/textbank/textbankHouseholdRecord')
const lockNewHouseHolds = async(detail) => {
    try { 

        var tbHouseHoldRecords = await TextbankHouseHoldRecord.aggregate([
            {$match: {
                'activityID': detail.activityID,
                'lockedBy': {$exists: false},
            }},
        ]).allowDiskUse(true).sample(5)

        for(var i = 0; i < tbHouseHoldRecords.length; i++){
            await TextbankHouseHoldRecord.updateOne({_id: tbHouseHoldRecords[i]._id}, {$set: {
                    initTextSent: false,
                    lockedBy: detail.userID,
                    numTextSent: 0,
                    textReceived: false
            }})
        }

        if (tbHouseHoldRecords.length > 0){
            return {success: true, lockedHouseHoldIDs: tbHouseHoldRecords, msg: "Found."}
        }

        return {success: false, msg: "Not Found."}
    
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {lockNewHouseHolds}
