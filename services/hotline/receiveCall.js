var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;
var HotlineContactHistory = require('../../models/activities/hotline/hotlineContactHistory');
var Activity = require('../../models/activities/activity')

const receiveCall = async(detail) => {
    try {
        
        console.log("Incoming Call...")

        const twiml = new VoiceResponse();

        var blockedHistories = await HotlineContactHistory.find({blocked: true, residentPhoneNum: detail.From})

        if(blockedHistories.length > 0){
            twiml.say("Blocked")
            return twiml.toString();
        }

        const dial = twiml.dial()

        var activity = await Activity.findOne({active: true, activityType: 'Hotline', 'hotlineMetaData.mainPhoneNumber': detail.To})
        var twiml_url = process.env.be + '/api/incomingCallStatus'
        
        for(var i = 0; i < activity.userIDs.length; i++){
            var twilio_client = activity.userIDs[i] + activity._id
            
            dial.client(twilio_client,{
                statusCallbackEvent: 'answered',
                statusCallback: twiml_url,
                statusCallbackMethod: 'POST'
            });
        }

        var voiceMailNumber = activity.hotlineMetaData.voiceMailNumber
        dial.number(voiceMailNumber);

        return twiml.toString();
        
    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {receiveCall}