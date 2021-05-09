var IncomingTwilioRecord = require('../../models/activities/hotline/incomingTwilioRecord');

const incomingCallStatus = async(detail) => {
    try { 
        var twilioRecord = {parentCallSid: detail.ParentCallSid,
            callSid: detail.CallSid,
            residentPhoneNum: detail.From,
            userPhoneNum: detail.CalledVia
        }

        var incomingTwilioRecord = new IncomingTwilioRecord(twilioRecord)
        incomingTwilioRecord.save()

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {incomingCallStatus}