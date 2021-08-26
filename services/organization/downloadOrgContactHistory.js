var OutreachReport = require('../../models/campaigns/outreachReport')
var People = require('../../models/people/people')

const downloadOrgContactHistory = async(detail) => {
    try { 
        return await OutreachReport.aggregate([{$match: {orgID: detail.orgID, $or: [{person: {$exists: true}}, {affidavit: {$exists: true}}]}}])
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadOrgContactHistory}