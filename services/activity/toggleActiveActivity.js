var Activity = require('../../models/activities/activity')

const toggleActiveActivity = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)

        if(activity.active){
            activity.active = false
            return activity.save()
        }

        activity.active = true
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {toggleActiveActivity}