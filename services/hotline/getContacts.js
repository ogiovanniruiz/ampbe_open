var Contact = require('../../models/hotline/contact')
const getContacts = async(detail) => {
    try { 
        return Contact.find({orgID: detail.orgID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getContacts}