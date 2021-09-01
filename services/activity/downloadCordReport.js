var Activity = require('../../models/activities/activity')
var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')
var TextbankContactHistory = require('../../models/activities/textbank/textbankContactHistory')
var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')

const downloadCordReport = async(details) => {
    try { 

        var activity = await Activity.findById(details.activityID)
        if(details.activityType === 'Texting'){

            var activityReport = await TextbankContactHistory.find({activityID: details.activityID})


            for(var i = 0; i < activityReport.length; i++){
                var user = await User.findById(activityReport[i].userID)
                activityReport[i].userName = user.name
    
                var org = await Organization.findById(activityReport[i].orgID)
                activityReport[i].orgName = org.name
            }
            return {report: activityReport, activityName: activity.name}


        }

        if(details.activityType === 'Phonebank'){

            var activityReport = await PhonebankContactHistory.find({activityID: details.activityID})

            for(var i = 0; i < activityReport.length; i++){
                var user = await User.findById(activityReport[i].userID)
                activityReport[i].userName = user.name
    
                var org = await Organization.findById(activityReport[i].orgID)
                activityReport[i].orgName = org.name
            }
            return {report: activityReport, activityName: activity.name}
        }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadCordReport}