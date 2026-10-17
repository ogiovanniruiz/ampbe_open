var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var {currentPass} = require('./currentPass')

const finishCall = async(finishCallDetail) => {
    try { 

        // The page only learns the CallSid once the call rings, so a call that failed sooner is found by its attemptID
        // (recent calls only, which keeps the lookup on the creationDate index)
        var query = finishCallDetail.callSid
            ? {"phonebankContactDetails.CallSid": finishCallDetail.callSid}
            : finishCallDetail.attemptID
                ? {"phonebankContactDetails.attemptID": finishCallDetail.attemptID, creationDate: {$gte: new Date(Date.now() - 2 * 60 * 60 * 1000)}}
                : null
        if(!query) return false

        var phoneContactHistory = await ActivityContactRecord.findOne(query)
        if(phoneContactHistory){
            console.log('userID:', finishCallDetail.userID)

            if(!finishCallDetail.userID){
                console.log("No userID provided in finishCallDetail")
                return false
            }
            var dbCallStartTime = phoneContactHistory.creationDate.getTime()/1000
            var callEndTime = new Date().getTime()/1000

            if(!phoneContactHistory.phonebankContactDetails){
                console.log(finishCallDetail)
            }

            phoneContactHistory.phonebankContactDetails.lengthOfCall = callEndTime - dbCallStartTime
            phoneContactHistory.orgID = finishCallDetail.orgID
            phoneContactHistory.activityID = finishCallDetail.activityID
            phoneContactHistory.campaignID = finishCallDetail.campaignID
            phoneContactHistory.user = finishCallDetail.user
            phoneContactHistory.userID = finishCallDetail.userID
            phoneContactHistory.activityHouseholdRecordID = finishCallDetail.activityHouseholdRecordID
            phoneContactHistory.person = finishCallDetail.person
            phoneContactHistory.personID = finishCallDetail.personID
            phoneContactHistory.pass = await currentPass({activityID: finishCallDetail.activityID, fallback: finishCallDetail.pass})

            return phoneContactHistory.save() 
        }

        return false
         
    } catch(e){
        console.log(e)
        throw new Error(e.message)
    }
}

module.exports = {finishCall}