var Activity = require('../../models/activities/activity')

const getActivity = async(detail) => {
    try { 
        return Activity.findById(detail.activityID)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivity}