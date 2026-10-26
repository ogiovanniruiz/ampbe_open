var Membership = require('../../models/people/membership')

const getActivityMembershipList = async(detail) => {
    try { 
        return await Membership.aggregate([{ $match: { 'enrollment.orgID': detail.orgID, activityIDs: detail.activityID }}])
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivityMembershipList}