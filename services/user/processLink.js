var Rdr  = require('../../models/users/redirectNewUser')
var Activity = require('../../models/activities/activity')
const processLink = async(rdrToken) => {
    try { 
        var redirectData = await Rdr.findOne({_id: rdrToken.linkID})

        if(!redirectData){
            return
        }

        if(redirectData.activityID){

            var activity = await Activity.findOne({_id: redirectData.activityID})

            return {redirectData: redirectData, active: activity.active}

        }

        return {redirectData: redirectData, active: false}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {processLink}