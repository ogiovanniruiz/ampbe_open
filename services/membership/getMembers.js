var Membership = require('../../models/organizations/membership')

const getMembers = async(detail) => {
    try { 
        return await Membership.find({'resident.orgID': detail.orgID}).sort( { date: -1 })
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMembers}