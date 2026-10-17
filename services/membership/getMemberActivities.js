var mongoose = require('mongoose');
var Membership = require('../../models/people/membership')
var Activity = require('../../models/activities/activity')

const { ObjectId } = mongoose.Types;

// Activities that added or opted in members for this org, with how many members each
const getMemberActivities = async(detail) => {
    try {
        var counts = await Membership.aggregate([
            {$match: {'enrollment.orgID': detail.orgID, 'activityIDs.0': {$exists: true}}},
            {$unwind: '$activityIDs'},
            {$group: {_id: '$activityIDs', count: {$sum: 1}}},
        ])

        var ids = counts.map(c => c._id).filter(id => ObjectId.isValid(id))
        var activities = await Activity.find({_id: {$in: ids}}, {name: 1, activityType: 1, active: 1, completed: 1}).lean()
        var byID = new Map(activities.map(a => [String(a._id), a]))

        return counts
            .map(c => {
                var activity = byID.get(String(c._id))
                return {_id: c._id, name: activity?.name || 'Deleted activity', activityType: activity?.activityType || '', count: c.count}
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMemberActivities}
