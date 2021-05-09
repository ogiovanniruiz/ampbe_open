var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')


const logCallLength = async(data) => {
    try { 

        var phoneContactHistory = await PhonebankContactHistory.findOne({personID: data.residentID, 
                                                                         activityID: data.activityID, 
                                                                         userID: data.userID,
                                                                         pass: data.passes
                                                                        
                                                                        })

        if(phoneContactHistory){
            console.log("Contact History found. Logging Call length.")
            
            var dbCallStartTime = phoneContactHistory.callInitTime.getTime()/1000
            var callEndTime = new Date().getTime()/1000
            phoneContactHistory.lengthOfCall = callEndTime - dbCallStartTime
            return phoneContactHistory.save()
                   
        }else{
            console.log("No contact history found to log call length.")
        }
         
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {logCallLength}