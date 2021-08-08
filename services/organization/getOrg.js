var Organization = require('../../models/organizations/organization')

const getOrg = async(data) => {
    try {
        return await Organization.findById(data.orgID)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrg}