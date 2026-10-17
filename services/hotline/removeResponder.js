var Responder = require('../../models/hotline/responder')
const removeResponder = async(detail) => {
    try { 
        return await Responder.deleteOne({_id: detail.responderID})
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeResponder}