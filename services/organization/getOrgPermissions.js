var Organization = require('../../models/organizations/organization')

const getOrgPermissions = async(user) => {
    try {
        
        if(user.dev){return await Organization.find({}, null, {sort: {name: 1}})}

        var orgIDs = user.orgPermissions.map(function(org){ return org.orgID})
       
        return await Organization.find({_id: {$in: orgIDs}})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgPermissions}