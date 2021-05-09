var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')

const callStatus = async(detail) => {
    try { 
        console.log('Call Status: ',detail.CallStatus)
        if(detail.CallStatus === 'failed' || detail.CallStatus === 'completed' || detail.CallStatus === 'no-answer'){           
            var phoneContactHistory = await PhonebankContactHistory.findOne({'CallSid': detail.ParentCallSid})
            if(phoneContactHistory){
                console.log("Phonebank Contact History Found. Applying Status.")
                phoneContactHistory.status = detail.CallStatus
                phoneContactHistory.save()
            }
        }

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {callStatus}