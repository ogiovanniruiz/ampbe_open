var Activity = require('../../models/activities/activity')
var User = require('../../models/users/user')

const allocatePhoneNumber = async(data) => {
    try { 
        var activity = await Activity.findById(data.activityID)

        var user = await User.findById(data.userID)
        var userFullName = user.name.firstName + ' ' + user.name.lastName

        var phoneNumber = {
                           userID: data.userID, 
                           number: data.phoneNumber,
                           userFullName: userFullName
                           }

        activity.textMetaData.activityPhonenums.push(phoneNumber)
        return activity.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {allocatePhoneNumber}