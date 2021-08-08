var Campaign = require('../../models/campaigns/campaign')

const wipeReport = async(request) => {
    try { 
        var campaign = await Campaign.findOne({campaignID: request.campaignID})
        campaign.outReachReport = []
    
        return await campaign.save()


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {wipeReport}