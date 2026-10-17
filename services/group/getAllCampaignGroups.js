var Group = require('../../models/groups/group')
var Activity = require('../../models/activities/activity')

const getAllCampaignGroups = async(detail) => {
    try {
        var groups = await Group.find({campaignID: detail.campaignID}).sort({_id:-1}).lean()

        // How many activities were created from each group, so the UI can warn before archiving or deleting
        var usage = groups.length ? await Activity.aggregate([
            {$match: {campaignID: detail.campaignID, groupID: {$in: groups.map(g => String(g._id))}}},
            {$group: {_id: '$groupID', count: {$sum: 1}}}
        ]) : []
        var counts = new Map(usage.map(u => [String(u._id), u.count]))

        return groups.map(group => ({...group, activityCount: counts.get(String(group._id)) || 0}))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllCampaignGroups}
