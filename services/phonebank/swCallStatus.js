var ActivityContactRecord = require('../../models/activities/activityContactRecord')
const swCallStatus = async(swIncomingStatus) => {
    try {
        if(swIncomingStatus.state === 'early'){           
            var phonebankContactRecord = await ActivityContactRecord.findOne({'phonebankContactDetails.CallSid': swIncomingStatus.id})
            if(phonebankContactRecord){
                console.log("Phonebank Contact History Found. Applying Non Answer Status.")
                phonebankContactRecord.phonebankContactDetails.status = "no-answer"
                return await phonebankContactRecord.save()
            }
        }else if(swIncomingStatus.state === 'active'){         
            var phonebankContactRecord = await ActivityContactRecord.findOne({'phonebankContactDetails.CallSid': swIncomingStatus.id})
            if(phonebankContactRecord){
                console.log("Phonebank Contact History Found. Applying Completed Status.")
                phonebankContactRecord.phonebankContactDetails.status = "completed"
                return await phonebankContactRecord.save()
            }
        }else if(swIncomingStatus.state === 'trying') {
            var phonebankContactRecord = await ActivityContactRecord.findOne({'phonebankContactDetails.CallSid': swIncomingStatus.id})
            if(phonebankContactRecord){
                console.log("Phonebank Contact History Found. Applying Failed Status.")
                phonebankContactRecord.phonebankContactDetails.status = "failed"
                return await phonebankContactRecord.save()
            }
        }
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {swCallStatus}