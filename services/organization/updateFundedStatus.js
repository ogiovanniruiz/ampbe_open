var Organization = require('../../models/organizations/organization')

const updateFundedStatus = async(detail) => {
    try { 
        var org = await Organization.findById(detail.orgID)
        org.funded = detail.status
        await org.save()
        return {success: true, org: org, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateFundedStatus}