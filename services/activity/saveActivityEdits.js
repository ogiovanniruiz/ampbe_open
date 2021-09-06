var Activity = require('../../models/activities/activity')

const saveActivityEdits = async(details) => {
    try { 
        var activity = await Activity.findById(details.activityID)

        activity.name = details.edits.name
        activity.description = details.edits.description

        if(activity.activityType === 'Texting'){ 
            activity.textMetaData.initTextMsg = details.edits.initTextMsg
            activity.textMetaData.quickResponses = details.edits.quickResponses
            activity.textMetaData.sendReceiverName =  details.edits.sendReceiverName
            activity.textMetaData.sendSenderName = details.edits.sendSenderName
            activity.textMetaData.attachImage = details.edits.attachImage
            activity.textMetaData.imageUrl = details.edits.imageUrl
        }

        activity.orgIDs = details.edits.orgIDs
        activity.userIDs = details.edits.userIDs
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {saveActivityEdits}
