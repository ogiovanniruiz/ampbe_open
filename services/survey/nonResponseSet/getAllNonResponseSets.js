var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')
var Activity = require('../../../models/activities/activity')

const getAllNonResponseSets = async(detail) => {
    try { 
        var sets = await NonResponseSet.find({$or: [{orgID: detail.orgID}, {campaignIDs: detail.campaignID}]}).sort({_id:-1}).lean();

        // How many activities use each set, so the UI can warn before archiving or deleting
        var ids = sets.map(set => String(set._id))
        var usage = ids.length ? await Activity.aggregate([
            {$match: {nonResponseSetID: {$in: ids}}},
            {$group: {_id: '$nonResponseSetID', count: {$sum: 1}}}
        ]) : []
        var counts = new Map(usage.map(u => [String(u._id), u.count]))

        return sets.map(set => ({...set, activityCount: counts.get(String(set._id)) || 0}))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllNonResponseSets}
