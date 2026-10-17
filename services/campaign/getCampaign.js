var Campaign = require('../../models/campaigns/campaign')

const getCampaign = async(data) => {
    try {
        return await Campaign.findOne({campaignID: data.campaignID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaign}