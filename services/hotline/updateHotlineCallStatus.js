var HotlineCall = require('../../models/hotline/hotlineCall')
var Dispatcher = require('../../models/hotline/dispatcher')


const updateHotlineCallStatus = async(call) => {
    try { 

      var hotlineCall = await HotlineCall.findOne({callSid: call.ParentCallSid})

      if(call.CallStatus === "answered"){
        let newStr = call.To.substring(2);
        var dispatcher = await Dispatcher.findOne({phonenumber: newStr})
        hotlineCall.dispatcher_phonenumber = call.To
        hotlineCall.dispatcher_name = dispatcher.name
        hotlineCall.dispatcher_userID = dispatcher.userID

        dispatcher.in_active_call = true
        await dispatcher.save()
      }

      if(call.CallStatus === "completed"){
        let newStr = call.To.substring(2);
        var dispatcher = await Dispatcher.findOne({phonenumber: newStr})
        dispatcher.in_active_call = false
        await dispatcher.save()

      }

      hotlineCall.call_status = call.CallStatus
      await hotlineCall.save()

    } catch(e){
        throw new Error(e.message)

    }
}

module.exports = {updateHotlineCallStatus}