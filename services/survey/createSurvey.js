var Survey = require('../../models/surveys/survey.js')

const createSurvey = async(newSurvey) => {
    try { 

        // Volunteers must answer a single/multi-select question to submit a response
        if(!(newSurvey.questions || []).some(q => q.questionType === 'SINGLESELECT' || q.questionType === 'MULTISELECT')){
            return {success: false, msg: "Add at least one single- or multiple-choice question: volunteers can't submit a response without one."}
        }

        // $in: an array value would only match surveys whose campaign list is exactly the same
        var survey = await Survey.findOne({name: newSurvey.name, campaignIDs: {$in: newSurvey.campaignIDs || []}})

        if(survey){
            return {success: false, msg: "A survey with this name already exists in this campaign."}
        }
       
        var newSurvey = new Survey(newSurvey)
        await newSurvey.save()
        return {success: true, survey: newSurvey, msg: "Success."}
        
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createSurvey}