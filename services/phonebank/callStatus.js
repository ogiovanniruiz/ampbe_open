var ActivityContactRecord = require('../../models/activities/activityContactRecord')
const callStatus = async(twilioIncomingStatus) => {
    try {
        if((twilioIncomingStatus.DialCallStatus === 'failed' || twilioIncomingStatus.DialCallStatus === 'completed' || twilioIncomingStatus.DialCallStatus === 'no-answer') && twilioIncomingStatus.CallSid){           
            var phonebankContactRecord = await ActivityContactRecord.findOne({'phonebankContactDetails.CallSid': twilioIncomingStatus.CallSid})
            if(phonebankContactRecord){
                console.log("Phonebank Contact History Found. Applying Status.")
                phonebankContactRecord.phonebankContactDetails.status = twilioIncomingStatus.DialCallStatus
                await phonebankContactRecord.save()
            }else{
                console.log("Phonebank Contact History Not Found. No Status Applied.")
            }
        }else{
            console.log("THERE WAS A PROBLEM RECORDING THE CALL STATUS")
    
        }

        return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {callStatus}