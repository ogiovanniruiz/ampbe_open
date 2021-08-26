var OutreachReport = require('../../models/campaigns/outreachReport')
var People = require('../../models/people/people')

const downloadCampaignContactHistory = async(data) => {
    try {
        return await OutreachReport.aggregate([{$match: {campaignID: data.campaignID , $or: [{person: {$exists: true}}, {affidavit: {$exists: true}}]}}])

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadCampaignContactHistory}