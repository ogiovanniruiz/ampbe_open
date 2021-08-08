var Script = require('../../models/scripts/script.js')

const getCampaignScripts = async(detail) => {
    try { 
        return await Script.find({campaignIDs: detail.campaignID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignScripts}