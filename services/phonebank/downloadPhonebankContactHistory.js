var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const downloadPhonebankContactRecords = async(detail) => {
    try { 
        return ActivityContactRecord.find({activityID: detail.activityID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadPhonebankContactRecords}