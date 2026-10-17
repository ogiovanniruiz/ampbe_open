var Responder = require('../../models/hotline/responder')
const HotlineCall = require('../../models/hotline/hotlineCall')
const saveCallNotes = async(detail) => {
    try { 

        var hotlineCall = await HotlineCall.findOne({_id: detail._id})
        if(!hotlineCall) {
            throw new Error("Hotline call not found")
        }
        hotlineCall.notes = detail.notes
        return await hotlineCall.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {saveCallNotes}