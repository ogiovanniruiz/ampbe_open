var Group = require('../../models/groups/group')
const getCampaignWideGroups = async(detail) => {
    try { 
        return await Group.find({campaignID: detail.campaignID, campaignWide: true})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignWideGroups}