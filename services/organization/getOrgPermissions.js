var mongoose = require('mongoose')
var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')

// The organizations a user can switch to. Developer status and memberships come from the
// database, not the request, and only display fields are returned (org records hold Twilio and
// SignalWire credentials).
const getOrgPermissions = async(data) => {
    try {
        var userID = String(data?._id || '')
        if(!mongoose.Types.ObjectId.isValid(userID)) return []

        var user = await User.findById(userID, {dev: 1, orgPermissions: 1}).lean()
        if(!user) return []

        var levels = new Map((user.orgPermissions || []).map(p => [String(p.orgID), p.level]))
        var filter = user.dev ? {} : {_id: {$in: [...levels.keys()].filter(id => mongoose.Types.ObjectId.isValid(id))}}

        var orgs = await Organization.find(filter, {name: 1, description: 1, active: 1, subscription: 1, userIDs: 1}).sort({name: 1}).lean()

        return orgs.map(org => ({
            _id: org._id,
            name: org.name,
            description: org.description,
            active: org.active,
            subscription: org.subscription,
            memberCount: (org.userIDs || []).length,
            level: levels.get(String(org._id)) || null,
        }))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgPermissions}
