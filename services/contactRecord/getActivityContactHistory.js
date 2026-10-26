var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const getActivityContactHistory = async(activity) => {
    try { 
        return ActivityContactRecord.find({activityID: activity.activityID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivityContactHistory}