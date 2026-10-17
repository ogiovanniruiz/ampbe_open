var Membership = require('../../models/people/membership')

const getTagMembershipList = async(detail) => {
    try { 
        return await Membership.aggregate([{$match: { 'enrollment.orgID': detail.orgID, 'tags.label': detail.tag }}])
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getTagMembershipList}