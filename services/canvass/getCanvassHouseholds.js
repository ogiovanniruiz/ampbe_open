var Activity = require('../../models/activities/activity')
var Canvasshouseholdrecord = require('../../models/activities/canvass/canvassHouseHoldRecord')

const getCanvassHouseholds = async(details) => {
    try { 
        return await Canvasshouseholdrecord.find({activityID: details.activityID}).limit(100)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassHouseholds}