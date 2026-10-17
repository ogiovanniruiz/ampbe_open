var Organization = require('../../models/organizations/organization')

const updateAgreement = async(details) => {
    try { 
        
        var org = await Organization.findOne({_id: details.orgID})

        if (org.termsAgreement != details.status){
            org.termsAgreement = details.status
            await org.save()
            return {updated: true}

        }
        
        return {updated: false}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateAgreement}