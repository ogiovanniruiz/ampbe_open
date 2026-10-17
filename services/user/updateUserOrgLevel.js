var mongoose = require('mongoose')
var User = require('../../models/users/user')
var Organization = require('../../models/organizations/organization')

const LEVELS = ['OWNER', 'ADMINISTRATOR', 'VOLUNTEER']

// Sets a user's level in an org, approves a pending request (any level), or removes them / rejects the request ("REMOVE").
// An org has one owner: a new owner is only set with transfer, which makes every other owner an administrator.
const updateUserOrgLevel = async(data) => {
    try {
        var userID = String(data.userID || '')
        var orgID = String(data.orgID || '')
        var level = data.level
        var transfer = data.transfer === true
        if(!LEVELS.includes(level) && level !== 'REMOVE') return {success: false, msg: "Unknown level."}
        if(transfer && level !== 'OWNER') return {success: false, msg: "Unknown request."}
        if(!mongoose.Types.ObjectId.isValid(userID) || !mongoose.Types.ObjectId.isValid(orgID)) return {success: false, msg: "User or organization not found."}

        var user = await User.findOne({_id: userID})
        var org = await Organization.findById(orgID)
        if(!user || !org) return {success: false, msg: "User or organization not found."}

        var permission = (user.orgPermissions || []).find(p => p.orgID === orgID)

        // Never leave an organization without an owner
        if(permission?.level === 'OWNER' && level !== 'OWNER'){
            var owners = await User.countDocuments({orgPermissions: {$elemMatch: {orgID, level: 'OWNER'}}})
            if(owners <= 1) return {success: false, msg: "This is the organization's owner. Transfer ownership to another member first."}
        }

        // Only one owner: someone else already owning the org requires a transfer
        var otherOwners = []
        if(level === 'OWNER' && permission?.level !== 'OWNER'){
            otherOwners = await User.find({_id: {$ne: userID}, orgPermissions: {$elemMatch: {orgID, level: 'OWNER'}}})
            if(otherOwners.length && !transfer) return {success: false, msg: "This organization already has an owner. Use Transfer ownership instead."}
        }

        // Approving or rejecting clears the request (every copy, in case of old duplicates)
        org.requests = (org.requests || []).filter(id => id !== userID)

        if(level === "REMOVE"){
            user.orgPermissions = (user.orgPermissions || []).filter(p => p.orgID !== orgID)
            org.userIDs = (org.userIDs || []).filter(id => id !== userID)
            await org.save()

            // Only move their home if it was this org
            if(user.homeOrgID === orgID){
                user.homeOrgID = user.orgPermissions[0]?.orgID || null
            }
            await user.save()
            return {success: true, org: org, user: user, msg: permission ? "Org Access Removed." : "Request declined."}
        }

        if(permission){
            permission.level = level
            await user.save()
            await org.save()
        } else {
            user.orgPermissions.push({level, orgID})
            // A first org becomes home; someone joining a second org keeps their current home
            var homeIsValid = user.homeOrgID && user.orgPermissions.some(p => p.orgID === user.homeOrgID)
            if(!homeIsValid) user.homeOrgID = orgID
            await user.save()

            if(!org.userIDs.includes(userID)) org.userIDs.push(userID)
            await org.save()
        }

        // The new owner is saved first, so the org is never left without one
        if(transfer){
            for(var previousOwner of otherOwners){
                previousOwner.orgPermissions.forEach(p => { if(p.orgID === orgID && p.level === 'OWNER') p.level = 'ADMINISTRATOR' })
                await previousOwner.save()
            }
            return {success: true, org: org, user: user, msg: "Ownership transferred.", previousOwnerIDs: otherOwners.map(u => String(u._id))}
        }

        return {success: true, org: org, user: user, msg: permission ? "Org Level Updated." : "Org Level Appended."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateUserOrgLevel}
