var Dispatcher = require('../../models/hotline/dispatcher')

const getDispatchers = async(detail) => {
    try { 

        return await Dispatcher.find({orgID: detail.orgID})
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getDispatchers}