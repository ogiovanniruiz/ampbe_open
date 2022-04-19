var Activity = require('../../models/activities/activity')
var User = require('../../models/users/user')

const removeNumber = async(data) => {
    try { 
        var activity = await Activity.findById(data.activityID)

        for(var i = 0; i < activity.textMetaData.activityPhonenums.length; i++){
            if(activity.textMetaData.activityPhonenums[i].userID === data.number.userID){
                activity.textMetaData.activityPhonenums.splice(i, 1);      
            }
       }

        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeNumber}