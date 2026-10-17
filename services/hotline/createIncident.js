var Incident = require('../../models/hotline/incident');
var Geocode = require('../amp/geocode')
const createIncident = async(incident) => {
    try { 

        var newIncident = new Incident(incident)

        if(newIncident.location.coordinates.length === 0){
            var address_string = incident.address.address + " " + 
            incident.address.city + " " + 
            incident.address.state + " " +
            incident.address.zip
            var geocode = await Geocode.geocode(address_string)

            newIncident.address.county = geocode.parsedAddress.county.replace(" County", "").toUpperCase()
            newIncident.location.coordinates = geocode.coordinates
            newIncident.location.type = "Point"
        }

        var existing_incident = await Incident.findOne({$or: [{location: newIncident.location}, {'address.address': newIncident.address.address}], active: true})

        if(existing_incident){
            return false
        }

        return newIncident.save()



    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createIncident}