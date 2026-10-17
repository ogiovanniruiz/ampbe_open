var ActivityContactRecord = require('../../models/activities/activityContactRecord')
const conferenceCallStatus = async(twilioIncomingStatus) => {

    if((twilioIncomingStatus.CallStatus === 'failed' || twilioIncomingStatus.CallStatus === 'completed' || twilioIncomingStatus.CallStatus === 'no-answer') && twilioIncomingStatus.CallSid){           
                var phonebankContactRecord = await ActivityContactRecord.findOne({'phonebankContactDetails.CallSid': twilioIncomingStatus.CallSid})
                if(phonebankContactRecord){
                    console.log("Phonebank Contact History Found. Applying Status.")
                    phonebankContactRecord.phonebankContactDetails.status = twilioIncomingStatus.CallStatus
                    await phonebankContactRecord.save()
                }
    }else{
        console.log("THERE WAS A PROBLEM RECORDING THE CALL STATUS")

    }

    return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'


}

module.exports = {conferenceCallStatus}