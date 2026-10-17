var Membership = require('../../models/people/membership')

const getAllOrgMembers = async(detail) => {
    try { 
        return await Membership.find({'enrollment.orgID': detail.orgID}).sort( { 'enrollment.dateCreated': -1 })
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllOrgMembers}
