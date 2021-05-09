var Activity = require('../../models/activities/activity');

const getUsedHotlineNumbers = async(detail) => {
    try { 

        var hotlines = await Activity.find({activityType: "Hotline"})
        var phonenums = []

        for(var i = 0; i < hotlines.length; i++){
            phonenums.push(hotlines[i].hotlineMetaData.mainPhoneNumber)
        }

        return phonenums
        
    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {getUsedHotlineNumbers}