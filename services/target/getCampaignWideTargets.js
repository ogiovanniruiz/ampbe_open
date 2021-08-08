var Target = require('../../models/targets/target')
const getCampaignWideTargets = async(detail) => {
    try { 
        return await Target.find({'properties.campaignID': detail.campaignID, 'properties.campaignWide': true})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignWideTargets}