var Membership = require('../../models/people/membership')
var {uploadQuery} = require('./memberFields')

const getUploadMembershipList = async(detail) => {
    try { 
        console.log("GETTING MEMBERSHIP LIST FOR ORG: ", detail.orgID, " AND UPLOAD ID: ", detail.uploadID)
        return await Membership.aggregate([{$match: { 'enrollment.orgID': detail.orgID, ...uploadQuery(detail.uploadID) }}])
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getUploadMembershipList}