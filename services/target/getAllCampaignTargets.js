var Target = require('../../models/targets/target')
const getAllCampaignTargets = async(detail) => {
    try {
        return await Target.find({'properties.campaignID': detail.campaignID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllCampaignTargets}
