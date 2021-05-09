var User = require('../../models/users/user')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')

const downloadTextContactHistory = async(data) => {
    try {
        var activityReport = await TextbankContactHistory.find({activityID: data.activityID})

        for(var i = 0; i < activityReport.length; i++){
            var user = await User.findById(activityReport[i].userID)
            activityReport[i].userName = user.name
        }

        return activityReport
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadTextContactHistory}