var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var JoinCallToConference =require('./joinCallToConference')
const call = async(call) => {
    try { 

        var newPhoneContactRecord = new ActivityContactRecord({phonebankContactDetails: call, activityType: "Phonebank"});
        await newPhoneContactRecord.save();

        var twiml = new VoiceResponse();


        if(call.conference === 'true'){

            var callBackUrl = process.env.be + '/api/conferenceCallStatus'
            var conference_room_name = call.CallSid
            var dial = twiml.dial({callerId : call.userPhonenumber, action: callBackUrl});
            dial.conference(conference_room_name,{
                statusCallback: callBackUrl,
                statusCallbackMethod: 'POST',
                statusCallbackEvent: 'end leave',
            });

            JoinCallToConference.joinCallToConference(call)
            return twiml.toString();
        }

        

        var callBackUrl = process.env.be + '/api/callStatus'
        // answerOnBridge: the caller's leg is answered when the resident answers, so the browser
        // sees "ringing" until then and "accept" at the real answer
        var dial = twiml.dial({callerId : call.userPhonenumber, action: callBackUrl, answerOnBridge: true});
            
        dial.number(call.residentPhonenumber,{
                statusCallbackEvent: 'initiated ringing answered completed',
                statusCallback: callBackUrl,
                statusCallbackMethod: 'POST',
            }
        )

        console.log(twiml.toString())

        return twiml.toString();
    } catch(e){

        return false
        
        throw new Error(e.message)
        
    }
}

module.exports = {call}
