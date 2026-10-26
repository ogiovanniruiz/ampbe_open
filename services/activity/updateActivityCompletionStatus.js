var Activity = require('../../models/activities/activity')

const updateActivityCompletionStatus = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)

        if(activity.completed){
            activity.completed = false
            return activity.save()
        }

        activity.completed = true
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateActivityCompletionStatus}