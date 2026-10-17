var Dispatcher = require('../../models/hotline/dispatcher')

const getDispatcherAccount = async(detail) => {
    try { 
        return await Dispatcher.findOne({userID: detail.userID})
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getDispatcherAccount}