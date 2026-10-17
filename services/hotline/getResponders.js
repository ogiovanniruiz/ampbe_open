var Responder = require('../../models/hotline/responder')
const getResponders = async(detail) => {
    try { 

        return Responder.find({orgID: detail.orgID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getResponders}