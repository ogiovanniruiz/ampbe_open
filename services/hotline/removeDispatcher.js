var Dispatcher = require('../../models/hotline/dispatcher')
const removeDispatcher = async(detail) => {

    try { 
        return await Dispatcher.deleteOne({userID: detail.userID})

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {removeDispatcher}