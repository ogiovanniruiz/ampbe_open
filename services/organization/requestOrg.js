var Organization = require('../../models/organizations/organization')

const requestOrg = async(details) => {
    try { 
        var org = await Organization.findOne({_id: details.org._id})

        if(org){
            if(org.requests.includes(details.user._id)){
                return {success: false, msg: "Request has already been submitted."}
            }
            if(org.userIDs.includes(details.user._id)){
                return {success: false, msg: "User is already a member of this org."}
            }
            org.requests.push(details.user._id)
            org.save()
            return {success: true, msg: "Success.", org: org}
        }         

        return {success: false, msg: "Organization Not Found"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {requestOrg}