var Organization = require('../../models/organizations/organization')

const createOrg = async(detail) => {
    try { 
        var newOrg = {
                      name: detail.name, 
                      description: detail.description
                     }

        var existingOrg = await Organization.findOne({name: detail.name})

        if(existingOrg){
            return {success: false, msg: "Organization with that name already exists."}
        }
        
        var org = new Organization(newOrg);
        org.save()

        return {success: true, org: org, msg:"Succces."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createOrg}