var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')
var User = require('../../models/users/user')


const downloadPhonebankContactHistory = async(detail) => {
    try { 
        var activityReport = await PhonebankContactHistory.find({activityID: detail.activityID})

        for(var i = 0; i < activityReport.length; i++){
            var user = await User.findById(activityReport[i].userID)
            activityReport[i].userName = user.name
        }
        return activityReport
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadPhonebankContactHistory}