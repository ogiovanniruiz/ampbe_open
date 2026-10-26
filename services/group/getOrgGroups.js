var Group = require('../../models/groups/group')
const getOrgGroups = async(detail) => {
    try { 
        return await Group.find({campaignID: detail.campaignID, orgID: detail.orgID, active: true})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgGroups}
