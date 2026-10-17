var HotlineMessage = require('../../models/hotline/hotlineMessage')
const getMessages = async(detail) => {
    try { 

         return HotlineMessage.find({orgID: detail.orgID}).sort({ _id: -1 })

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMessages}