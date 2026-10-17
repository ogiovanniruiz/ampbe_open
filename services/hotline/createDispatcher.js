var Dispatcher = require('../../models/hotline/dispatcher')
const createDispatcher = async(dispatcher) => {
    try { 

        var newDispatcher = new Dispatcher(dispatcher)
        return newDispatcher.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createDispatcher}