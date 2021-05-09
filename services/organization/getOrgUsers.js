var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

const getOrgUsers = async(orgDetail) => {
    try {

        var org = await Organization.findOne({_id: orgDetail.orgID})
        var users = await User.find({ _id: {$in: org.userIDs}})
        var requests = await User.find({_id: {$in: org.requests}})

        var userList = users.concat(requests)
    
        return userList
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgUsers}