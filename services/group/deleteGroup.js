var Group = require('../../models/groups/group')
var Activity = require('../../models/activities/activity')

const deleteGroup = async(detail) => {
    try { 
        // Activities read their group's filters (e.g. when sizing), so a group in use must stay
        var activityCount = await Activity.countDocuments({groupID: String(detail._id)})
        if(activityCount > 0){
            return {success: false, msg: `Used by ${activityCount} ${activityCount === 1 ? 'activity' : 'activities'}, so it can't be deleted. Keep it archived instead.`}
        }

        var result = await Group.deleteOne({_id: detail._id})
        return {success: result.deletedCount > 0, msg: result.deletedCount > 0 ? 'Deleted.' : 'This group no longer exists.'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteGroup}
