var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

const getOrgUsers = async(orgDetail) => {
    try {
        var org = await Organization.findOne({_id: orgDetail.orgID})
        return await User.find({ _id: {$in: org.userIDs}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgUsers}