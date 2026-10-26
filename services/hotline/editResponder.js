var Responder = require('../../models/hotline/responder')
const editResponder = async(responder) => {
    try { 

        var found_responder = await Responder.findOne({_id: responder._id})

        if(!found_responder){
            throw new Error('Responder not found')
        }
        found_responder.audience = responder.audience  
        found_responder.name = responder.name
        found_responder.email = responder.email
        found_responder.phonenumber = responder.phonenumber
        //found_responder.address = responder.address 
        return found_responder.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editResponder}