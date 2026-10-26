var Membership = require('../../models/people/membership')
var {sourceQuery} = require('./memberFields')

const getUserMembershipList = async(detail) => {
    try { 
        return await Membership.aggregate([{$match: { 'enrollment.orgID': detail.orgID, ...sourceQuery('organizer', detail.userID) }}])
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getUserMembershipList}
