var Contact = require('../../models/hotline/contact')
var Geocode = require('../amp/geocode')

const createContact = async(contact) => {
    try { 
        
        var newContact = new Contact(contact)

        var address_string = contact.address.address + " " + 
        contact.address.city + " " + 
        contact.address.state + " " +
        contact.address.zip

        var geocode = await Geocode.geocode(address_string)
        newContact.location.coordinates = geocode.coordinates
        newContact.location.type = "Point"

        return newContact.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createContact}