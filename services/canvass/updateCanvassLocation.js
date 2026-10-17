var CanvassLocation = require('../../models/activities/canvassLocation')

const isValidLngLat = (coordinates) =>
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every(Number.isFinite) &&
    Math.abs(coordinates[0]) <= 180 &&
    Math.abs(coordinates[1]) <= 90

const updateCanvassLocation = async(details) => {
    try {
        // Older clients send the whole user object instead of userID/name
        const userID = details.userID || details.user?._id
        const name = details.name || details.user?.name || {}

        if(!userID || !details.activityID || !isValidLngLat(details.coordinates)) return false

        return CanvassLocation.findOneAndUpdate(
            {activityID: details.activityID, 'user._id': userID},
            {$set: {
                user: {
                    _id: userID,
                    name: {firstName: name.firstName, lastName: name.lastName, fullName: name.fullName},
                },
                location: {type: 'Point', coordinates: details.coordinates},
                dateUpdated: new Date(),
            }},
            {upsert: true, returnDocument: 'after'}
        )

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateCanvassLocation}
