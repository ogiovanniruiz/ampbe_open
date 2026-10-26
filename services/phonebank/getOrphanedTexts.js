var OrphanedText = require('../../models/activities/textbank/orphanedText')
var CallPool = require('../../models/organizations/callPool')
let Activity = require('../../models/activities/activity')

const getOrphanedTexts = async(detail) => {
    try { 

        let activities = await Activity.find({active: true, campaignID: detail.campaignID, textMetaData: {$exists: true}, activityType: "Phonebank"})
        let activityNumbers = activities.map(activity => {return activity.textMetaData.activityPhonenumber})

        return OrphanedText.find({To: {$in: activityNumbers}})

    } catch(e){
        throw new Error(e.message)    
    }
}

module.exports = {getOrphanedTexts}