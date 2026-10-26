const Geocodio = require('geocodio-library-node');
var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var Activity = require('../../models/activities/activity')
var IdentifyDistricts = require('../amp/identifyDistricts')

const joinParts = (parts, separator = ' ') => parts.filter(part => part !== undefined && part !== null && String(part).trim() !== '')
                                                   .map(part => String(part).trim())
                                                   .join(separator)

// A canvasser drops a household that isn't in the activity's list; it starts with no residents
const createCanvassHousehold = async(details) => {
    try {
        var activity = await Activity.findById(details.activityID)
        if(!activity || activity.active === false) throw new Error("Activity is not active")
        if(!activity.optinOption) throw new Error("Community opt-in is off for this activity")

        const [lng, lat] = details.coordinates || []
        if(typeof lng !== 'number' || typeof lat !== 'number') throw new Error("Coordinates needed")

        const geocodio = new Geocodio(process.env.geocodioAPIKey)
        const response = await geocodio.reverse(lat + "," + lng)
        const result = response?.results?.[0]
        if(!result?.address_components) throw new Error("Couldn't find an address here")

        const address = result.address_components
        const county = (address.county || '').replace(" County", "").toUpperCase()
        const city = (address.city || '').toUpperCase()

        const location = {type: 'Point', coordinates: [lng, lat]}

        var districts = {}
        var identifiedDistricts = await IdentifyDistricts.identifyDistricts(location)
        for(const district of identifiedDistricts){
            districts[district.properties.districtType.toLowerCase() + "ID"] = district.properties.identifier
        }

        var household = {
            _id: {
                streetNum: address.number,
                prefix: address.predirectional,
                street: address.street,
                suffix: address.suffix,
                city: city,
                state: {abbrv: address.state},
                zip: address.zip,
            },
            fullAddress1: joinParts([address.number, address.predirectional, address.street, address.suffix]),
            fullAddress2: joinParts([city, address.state]) + (address.zip ? ", " + address.zip : ''),
            county: county,
            accuracyType: result.accuracy_type,
            // Where it was dropped, not the geocoded point, so the marker stays under the canvasser's tap
            location: location,
            residents: [],
            districts: districts,
        }

        var record = new ActivityHouseholdRecord({activityID: details.activityID, household, dropped: true, droppedBy: details.userID})
        await record.save()

        // Same shape as getCanvassBuildingRecords so the map can add it as a marker
        return {_id: {location: record.household.location}, records: [record], complete: [false], passed: [false]}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createCanvassHousehold}
