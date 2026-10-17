var CanvassLocation = require('../../models/activities/canvassLocation')

const getCanvassLocations = async(details) => {
    try { 
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Project only what the map shows; older records may still embed full user objects
        return CanvassLocation.find(
            {activityID: details.activityID, dateUpdated: {$gte: oneHourAgo}},
            {'user._id': 1, 'user.name': 1, location: 1, dateUpdated: 1, activityID: 1}
        )

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCanvassLocations}
