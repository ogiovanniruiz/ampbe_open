var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const getAllNonResponseSets = async(detail) => {
    try { 
        return await NonResponseSet.find({$or: [{"orgStatus.orgID": detail.orgID}, {campaignIDs: detail.campaignID}]});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllNonResponseSets}