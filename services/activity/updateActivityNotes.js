var Activity = require('../../models/activities/activity')

const updateActivityNotes = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)

        activity.notes = details.notes || activity.notes
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateActivityNotes}