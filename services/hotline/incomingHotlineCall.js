var HotlineCall = require('../../models/hotline/hotlineCall')
var Dispatcher = require('../../models/hotline/dispatcher')
var SWCallPool = require('../../models/organizations/swCallPool')
const be_url = process.env.be

var Contact = require('../../models/hotline/contact')
const incomingHotlineCall = async(call) => {
    try { 

        var swCallPool = await SWCallPool.findOne({number: call.To})

        var new_hotline_call_object = {    orgID: swCallPool.orgID,
                                           callSid: call.CallSid,
                                           hotline_phonenumber: call.To,
                                           remote_phonenumber: call.From,
                                           direction: "incoming"
                                        }

        var hotline_call = new HotlineCall(new_hotline_call_object)
        await hotline_call.save()

        //////////////////////////////////////////////////////////////////////////////////////////

        var blocked_contact = await Contact.findOne({number: call.From, blocked: true})

        if(blocked_contact){
            var response_string =  
                        `<Response>
                            <Say voice="woman">Hello! Thank you for calling. No one is available at the moment.</Say>
                        </Response>`
            
            return response_string
        }

        var dispatchers = await Dispatcher.find({orgID: swCallPool.orgID, on_duty: true, in_active_call: false})

        if(dispatchers.length === 0 ){
            var response_string =   `<Response>
                                        <Say voice="woman">Hello! Thank you for calling. No one is available at the moment. Please send a text instead. Good Bye!</Say>
                                    </Response>`
            return response_string
        }

        var response_string = `<Response><Dial callerId='${call.To}' timeout="15">`

        var statusCallbackURL = be_url + "/api/updateHotlineCallStatus'"

        for( var i = 0; i < dispatchers.length; i++){
            response_string = response_string + "<Number statusCallback='" + statusCallbackURL + " statusCallbackEvent='initiated ringing answered completed' machineDetection='Enable'>+1" + dispatchers[i].phonenumber + "</Number>"
        }

        response_string = response_string + "</Dial><Say voice='woman'>Hello! Thank you for calling. No one is available at the moment. Please send a text instead. Good Bye!</Say></Response>"
        console.log(response_string)
        return response_string

    } catch(e){ 
        throw new Error(e.message)
    }
}

module.exports = {incomingHotlineCall}