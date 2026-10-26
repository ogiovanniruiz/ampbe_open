var Organization = require('../../models/organizations/organization')

const updateCallingService = async(data) => {
    var org = await Organization.findById(data.orgID)
    org.callingService = data.service
    return org.save()
}

module.exports = {updateCallingService}