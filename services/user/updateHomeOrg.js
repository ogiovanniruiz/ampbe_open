var mongoose = require('mongoose')
var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')

// Switches the user's home organization; only to one they belong to (developers can enter any)
const updateHomeOrg = async(data) => {
    try {
        var userID = String(data.userID || '')
        var orgID = String(data.orgID || '')
        if(!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(orgID)) return null

        var user = await User.findOne({_id: userID});
        if(!user) return null
        if(!(await Organization.exists({_id: orgID}))) return null

        var isMember = (user.orgPermissions || []).some(p => String(p.orgID) === orgID)
        if(!isMember && !user.dev) return null

        user.homeOrgID = orgID
        return await user.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateHomeOrg}
