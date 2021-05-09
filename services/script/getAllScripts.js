var Script = require('../../models/scripts/script.js')

const getAllScripts = async(detail) => {
    try { 
        return await Script.find({$or: [{"orgStatus.orgID": detail.orgID}, {campaignIDs: detail.campaignID}, {participatingOrgs: {$elemMatch: {orgID: detail.orgID, active: true}}}]});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllScripts}