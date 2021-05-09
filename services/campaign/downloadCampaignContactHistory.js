var OutreachReport = require('../../models/campaigns/outreachReport')

const downloadCampaignContactHistory = async(data) => {
    try {
        return await OutreachReport.find({campaignID: data.campaignID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadCampaignContactHistory}