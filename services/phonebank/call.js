var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;

var PhonebankContactHistory = require('../../models/activities/phonebank/phonebankContactHistory')
var People = require('../../models/people/people')

var Membership = require('../../models/organizations/membership')

const call = async(call) => {
    try { 
        console.log("Calling...");

        var newPhoneContactHistory = new PhonebankContactHistory(call);

        var person = {}

        if(call.idBy === 'MEMBERSHIP'){
            person = await Membership.findOne({'resident.personID': call.personID});
        }else{
            person = await People.findOne({'resident.personID': call.personID});
        }

        newPhoneContactHistory.person = person;

        newPhoneContactHistory.save();

        var twiml = new VoiceResponse();
        var dial = twiml.dial({callerId : call.userPhonenum});
        
        var twiml_url = process.env.be + '/api/callStatus'

        dial.number(call.residentPhonenum,{
            statusCallbackEvent: 'initiated ringing answered completed',
            statusCallback: twiml_url,
            statusCallbackMethod: 'POST'
        });

        return twiml.toString();
    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {call}
