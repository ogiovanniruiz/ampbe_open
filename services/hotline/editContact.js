var Contact = require('../../models/hotline/contact')
const editContact = async(contact) => {
    try { 

        var oldContact = await Contact.findOne({_id: contact._id})

        oldContact.blocked = contact.blocked
        return oldContact.save()
                
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editContact}