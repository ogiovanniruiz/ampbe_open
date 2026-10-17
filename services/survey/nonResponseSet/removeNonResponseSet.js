var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')
var Activity = require('../../../models/activities/activity')
var { getNonResponseSetUsage } = require('./getNonResponseSetUsage')

const removeNonResponseSet = async(nonResponseSet) => {
    try { 
        // Activities load their set by ID; deleting one in use leaves volunteers with no non-response buttons
        var activityCount = await Activity.countDocuments({nonResponseSetID: String(nonResponseSet._id)})
        if(activityCount > 0){
            return {success: false, msg: `This set is used by ${activityCount} ${activityCount === 1 ? 'activity' : 'activities'} and can't be deleted. Keep it archived instead.`}
        }

        // The Non-responses summary reads the set to label recorded contacts
        var usage = await getNonResponseSetUsage({nonResponseSetID: nonResponseSet._id})
        if(usage.total > 0){
            return {success: false, msg: `This set has ${usage.total === 1 ? '1 recorded contact' : usage.total.toLocaleString() + ' recorded contacts'} and can't be deleted. Keep it archived instead.`}
        }

        var result = await NonResponseSet.deleteOne({_id: nonResponseSet._id});
        return {success: result.deletedCount > 0, msg: result.deletedCount > 0 ? 'Deleted.' : 'This set no longer exists.'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeNonResponseSet}
