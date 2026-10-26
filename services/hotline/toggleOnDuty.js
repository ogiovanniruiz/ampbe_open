var Dispatcher = require('../../models/hotline/dispatcher')
const toggleOnDuty = async(detail) => {
    try { 
        var dispatcher = await Dispatcher.findOne({userID: detail.userID})
        dispatcher.on_duty = detail.check
        return dispatcher.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {toggleOnDuty}