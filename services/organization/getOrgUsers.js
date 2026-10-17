var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

const getOrgUsers = async(orgDetail) => {
    try {
        var org = await Organization.findOne({_id: orgDetail.orgID}, {userIDs: 1})
        if(!org) return []
        // Shown to other members: leave out web-push subscriptions, login providers and agreements
        return await User.find({ _id: {$in: org.userIDs}}, {swSub: 0, oauths: 0, userAgreements: 0}).sort({'name.firstName': 1})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgUsers}