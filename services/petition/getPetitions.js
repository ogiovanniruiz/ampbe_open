var Activity = require('../../models/activities/activity')

const getPetitions = async(details) => {
    try { 
        return await Activity.find({activityType: "Petition", orgIDs: details.orgID}).sort({ name: 1 });
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPetitions}