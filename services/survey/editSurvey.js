var Survey = require('../../models/surveys/survey.js')
var { getSurveyUsage } = require('./getSurveyUsage')

const CHOICE_TYPES = ['SINGLESELECT', 'MULTISELECT']
const answers = (n) => n === 1 ? '1 answer' : n + ' answers'

/**
 * Wording that already has answers can't change: summaries, group filters and reports
 * match answers by their stored text. Returns an error message, or null when allowed.
 */
const lockedChangeError = (originalQuestions, newQuestions, usage) => {
    for(const original of originalQuestions){
        const used = usage.questions[original.question]
        if(!used || !used.count) continue

        const updated = newQuestions.find(q => q.question === original.question)
        if(!updated){
            return `Can't remove or rename "${original.question}": it already has ${answers(used.count)}. Add a new question instead.`
        }

        const switchingChoice = CHOICE_TYPES.includes(original.questionType) && CHOICE_TYPES.includes(updated.questionType)
        if(updated.questionType !== original.questionType && !switchingChoice){
            return `Can't change the type of "${original.question}": it already has answers.`
        }

        for(const response of original.responses || []){
            const responseCount = used.responses[response.response] || 0
            if(!responseCount) continue
            if(!(updated.responses || []).some(r => r.response === response.response)){
                return `Can't remove or rename "${response.response}" in "${original.question}": it already has ${answers(responseCount)}. Add a new response instead.`
            }
        }
    }
    return null
}

const editSurvey = async(data) => {
    try { 
        var survey = await Survey.findOne({_id: data.surveyID})
        if(!survey) return {success: false, msg: "This survey no longer exists."}

        // Volunteers must answer a single/multi-select question to submit a response
        if(!(data.survey.questions || []).some(q => CHOICE_TYPES.includes(q.questionType))){
            return {success: false, msg: "Add at least one single- or multiple-choice question: volunteers can't submit a response without one."}
        }

        var usage = await getSurveyUsage({surveyID: data.surveyID})
        var lockError = lockedChangeError(survey.questions || [], data.survey.questions || [], usage)
        if(lockError) return {success: false, msg: lockError}

        if(survey.name != data.survey.name){
            var duplicateSurvey = await Survey.findOne({name: data.survey.name, campaignIDs: data.campaignID})
            if(duplicateSurvey){
                return {success: false, msg: "Survey with that name already exists."}
            }

            survey.name = data.survey.name
        }

        survey.campaignIDs = data.survey.campaignIDs
        survey.questions = data.survey.questions
        survey.optinOption =  data.survey.optinOption
        await survey.save()

        return {success: true, survey: survey, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editSurvey, lockedChangeError}
