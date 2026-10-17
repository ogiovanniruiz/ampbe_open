var Membership = require('../../models/people/membership')
var Organization = require('../../models/organizations/organization')
var {asObjectIds, groupSignature} = require('./memberUtils')

// Marks a duplicate group as different people, so it stops showing in Possible duplicates
const dismissDuplicateGroup = async(detail) => {
    try {
        var ids = asObjectIds(detail.memberIDs)
        var reason = String(detail.reason || '').trim()
        if(!detail.orgID || ids.length < 2 || !reason) return {success: false, msg: "A group needs at least two members."}

        var count = await Membership.countDocuments({'enrollment.orgID': detail.orgID, _id: {$in: ids}})
        if(count !== ids.length) return {success: false, msg: "Some of these members are no longer on the list. Refresh and try again."}

        await Organization.updateOne({_id: detail.orgID}, {$addToSet: {dismissedDuplicates: groupSignature(reason, ids)}})
        return {success: true}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {dismissDuplicateGroup}
