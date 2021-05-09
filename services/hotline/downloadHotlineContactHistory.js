var Activity = require('../../models/activities/activity');
var HotlineContactHistory = require('../../models/activities/hotline/hotlineContactHistory')

const downloadHotlineContactHistory = async(detail) => {
    try { 
        return await HotlineContactHistory.find({activityID: detail.activityID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadHotlineContactHistory}