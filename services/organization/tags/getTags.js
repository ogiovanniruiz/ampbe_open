var Organization = require('../../../models/organizations/organization')

const getTags = async(orgDetail) => {
    try {
        var org = await Organization.findOne({_id: orgDetail.orgID})
        return org.tags

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTags}