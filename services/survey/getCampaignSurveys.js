var Survey = require('../../models/surveys/survey.js')

const getCampaignSurveys = async(detail) => {
    try { 
        return await Survey.find({campaignIDs: detail.campaignID}).sort({name: 1});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignSurveys}