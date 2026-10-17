var Activity = require('../../models/activities/activity')

const getGroupActivities = async(detail) => {
    try { 
        return await Activity.find({campaignID: detail.campaignID, groupID: detail.groupID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getGroupActivities}