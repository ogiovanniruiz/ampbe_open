var Organization = require('../../models/organizations/organization')

const getAllOrgs = async() => {
    try { 
        return await Organization.find({active: true})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllOrgs}