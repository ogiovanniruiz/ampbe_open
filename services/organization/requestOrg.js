var mongoose = require('mongoose')
var Organization = require('../../models/organizations/organization')

const requestOrg = async(details) => {
    try { 
        // {userID, orgID}; older callers send the whole user and org
        var userID = String(details.userID || details.user?._id || '')
        var orgID = String(details.orgID || details.org?._id || '')
        if(!mongoose.Types.ObjectId.isValid(userID)) return {success: false, msg: "Your account couldn't be identified. Please sign in again."}
        if(!mongoose.Types.ObjectId.isValid(orgID)) return {success: false, msg: "Organization Not Found"}

        var org = await Organization.findOne({_id: orgID, active: true}, {name: 1, userIDs: 1, requests: 1})
        if(!org) return {success: false, msg: "Organization Not Found"}

        if((org.userIDs || []).includes(userID)){
            return {success: false, msg: "You're already a member of this organization."}
        }
        if((org.requests || []).includes(userID)){
            return {success: false, msg: "Request has already been submitted."}
        }

        // Atomic, so a double click can't add the request twice
        var result = await Organization.updateOne(
            {_id: orgID, userIDs: {$ne: userID}, requests: {$ne: userID}},
            {$addToSet: {requests: userID}}
        )
        if(!result.modifiedCount) return {success: false, msg: "Request has already been submitted."}

        return {success: true, msg: "Success.", orgName: org.name}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {requestOrg}
