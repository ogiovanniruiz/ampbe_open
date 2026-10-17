var CanvassLocation = require('../../models/activities/canvassLocation')

// Called when a canvasser stops sharing, so they disappear from everyone's map
const removeCanvassLocation = async(details) => {
    try {
        if(!details.activityID || !details.userID) return false

        return CanvassLocation.deleteOne({activityID: details.activityID, 'user._id': details.userID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeCanvassLocation}
