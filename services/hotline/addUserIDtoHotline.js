var Activity = require('../../models/activities/activity');
var HotlineContactHistory = require('../../models/activities/hotline/hotlineContactHistory')

const addUserIDtoHotline = async(detail) => {
    try {
        var hotline = await Activity.findById(detail.activityID)

        if(hotline){
            for(var i = 0; i < hotline.userIDs.length; i++){
                if(hotline.userIDs[i] === detail.userID){
                    return {msg: "Already User"}
                }
            }
            hotline.userIDs.push(detail.userID)
            hotline.save()
            return {msg: "Added."}
        }

        return {msg: "Fail"}
        


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {addUserIDtoHotline}