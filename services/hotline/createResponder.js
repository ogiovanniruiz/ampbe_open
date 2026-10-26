var Responder = require('../../models/hotline/responder')
var Geocode = require('../amp/geocode')

const createResponder = async(responder) => {
    try { 

        var newResponder = new Responder(responder)

        var address_string = responder.address.address + " " + 
        responder.address.city + " " + 
        responder.address.state + " " +
        responder.address.zip

        var geocode = await Geocode.geocode(address_string)
        newResponder.location.coordinates = geocode.coordinates
        newResponder.location.type = "Point"

        return newResponder.save()


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createResponder}