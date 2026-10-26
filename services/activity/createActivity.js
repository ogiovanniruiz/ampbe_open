var Activity = require('../../models/activities/activity')
var GenerateActivityHHRecords = require('./generateActivityHHRecords')
var NormalizeTextMetaData = require('./normalizeTextMetaData')

const createActivity = async(details) => {
    try { 

        var foundActivity = await Activity.findOne({name: details.name, campaignID: details.campaignID})

        if(foundActivity){
            return false
        }

        if(!NormalizeTextMetaData.normalizeTextMetaData(details.textMetaData)){
            return false
        }

        var newActivity = new Activity(details)

        if(details.activityType != "Petition"){
            // Runs in the background; an uncaught failure here would take the whole server down
            GenerateActivityHHRecords.generateActivityHHRecords(newActivity)
                .catch(e => console.log('Activity ' + newActivity._id + ' household build failed: ' + e.message))
        }else{
            newActivity.hhReady = true
        }

        await newActivity.save()

        return true

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createActivity}
