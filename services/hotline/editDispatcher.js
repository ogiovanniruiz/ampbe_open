var mongoose = require('mongoose');
var Dispatcher = require('../../models/hotline/dispatcher');

const editDispatcher = async(dispatcher) => {
    try { 

        var oldDispatcher = await Dispatcher.findOne({userID: dispatcher.userID})

        oldDispatcher.phonenumber = dispatcher.phonenumber
        return oldDispatcher.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editDispatcher}