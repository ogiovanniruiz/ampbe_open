var HotlineCall = require('../../models/hotline/hotlineCall')

const outgoingHotlineCall = async(call) => {
    var hotline_call = new HotlineCall(call)
    return await hotline_call.save()
}

module.exports = {outgoingHotlineCall}