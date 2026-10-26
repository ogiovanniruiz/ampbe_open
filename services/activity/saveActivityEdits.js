var Activity = require('../../models/activities/activity')
var NormalizeTextMetaData = require('./normalizeTextMetaData')

const saveActivityEdits = async(editedActivity) => {
    try { 

        var activity = await Activity.findById(editedActivity._id)

        if(activity.name != editedActivity.name){
            var foundActivity = await Activity.findOne({name: editedActivity.name, campaignID: editedActivity.campaignID})
            if(foundActivity){
                return false
            }
        }

        if(!NormalizeTextMetaData.normalizeTextMetaData(editedActivity.textMetaData)){
            return false
        }

        activity.name = editedActivity.name
        activity.description = editedActivity.description
        activity.enableTexting = editedActivity.enableTexting
        activity.optinOption = !!editedActivity.optinOption

        //if(activity.activityType === 'Texting' || activity.enableTexting){ 
        activity.textMetaData = editedActivity.textMetaData
        //}

        if(activity.activityType === 'Phonebank'){
            activity.scriptLink = editedActivity.scriptLink
            activity.patchThroughNumber = editedActivity.patchThroughNumber
        }

        if(activity.activityType === 'Petition'){
            activity.petitionMetadata = editedActivity.petitionMetadata
        }

        activity.orgIDs = editedActivity.orgIDs
        activity.userIDs = editedActivity.userIDs
        activity.questionsToHide = editedActivity.questionsToHide
        activity.tagsToHide = editedActivity.tagsToHide || []
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {saveActivityEdits}
