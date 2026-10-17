var Contact = require('../../models/hotline/contact')
const removeContact = async(detail) => {

    try { 
        return await Contact.deleteOne({_id: detail.contactID})

    } catch(e){
        
        throw new Error(e.message)
        
    }
}

module.exports = {removeContact}