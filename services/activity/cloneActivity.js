var Activity = require('../../models/activities/activity')
var GenerateActivityHHRecords = require('./generateActivityHHRecords')

const cloneActivity = async(details) => {
    try { 

        var foundActivity = await Activity.findById(details.activityID, {_id:0, 'textMetaData._id': 0, __v: 0})
        
        if(!foundActivity){
            return false
        }

        const clonedDoc = { ...foundActivity._doc }; 

        var newTextMetaData = clonedDoc.textMetaData

        newTextMetaData.activityPhonenumber = ''

        clonedDoc.name = "Clone of " + details.activityID
        clonedDoc.description = "Clone of " + foundActivity.name
        clonedDoc.hhReady = false

        var newActivity = new Activity(clonedDoc)

        GenerateActivityHHRecords.generateActivityHHRecords(newActivity)

        return newActivity.save()


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {cloneActivity}
