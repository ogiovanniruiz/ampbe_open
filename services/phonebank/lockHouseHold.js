var phonebankHouseHoldRecord = require('../../models/activities/phonebank/phonebankHouseHoldRecord');

const lockHouseHold = async(detail) => {
    try {

        var pbHHRecord = await phonebankHouseHoldRecord.findOne({
            'activityID': detail.activityID,
            'lockedBy': detail.userID,
            'complete': false,
            'passed': false
        });

        if(pbHHRecord){
            return {success: true, houseHold: pbHHRecord.houseHold, msg: "Found Existing."};
        }

        var pbHHRecord = await phonebankHouseHoldRecord.aggregate([
            {$match: {
                'activityID': detail.activityID,
                'lockedBy': {$ne: detail.userID},
                'passed': false
            }},
            {$set: {lockedBy: detail.userID}}
            
        ]).allowDiskUse(true).sample(1)
        
        if(pbHHRecord.length > 0){
            await phonebankHouseHoldRecord.updateOne({_id: pbHHRecord[0]._id}, {$set: {lockedBy: detail.userID}})
            return {success: true, houseHold: pbHHRecord[0].houseHold, msg: "Found new household."}
        }

        return {success: false, houseHold: {}, msg: "Not Found."}

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {lockHouseHold}
