var Activity = require('../../models/activities/activity')

const getActivities = async(details) => {
    try { 
        return await Activity.find(details, {textMetaData: 0});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivities}