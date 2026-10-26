var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
let Activity = require('../../models/activities/activity')
const getPhonebankTextResponses = async(data) => {
    try {

        let activityContactRecords = await ActivityContactRecord.find({
                activityType: "Texting", 
                activityID: data.activityID,
                "textbankContactDetails.textReceived.status": true
            }
        )
        return activityContactRecords
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPhonebankTextResponses}
