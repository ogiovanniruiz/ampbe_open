var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

const getOrgUserRequests = async(orgDetail) => {
    try {

        var org = await Organization.findOne({_id: orgDetail.orgID}, {requests: 1})
        if(!org) return []
        return await User.find({ _id: {$in: org.requests}}, {name: 1, loginEmail: 1}).sort({'name.firstName': 1})
 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgUserRequests}