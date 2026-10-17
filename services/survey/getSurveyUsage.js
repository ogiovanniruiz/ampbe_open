var Survey = require('../../models/surveys/survey.js')
var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Activity = require('../../models/activities/activity')

/**
 * How many recorded answers each question and response of a survey has.
 * Answers are stored as text, so any question/response with answers must keep its wording
 * or summaries, group filters and reports stop matching the past data.
 *
 * Returns {total, questions: {[questionText]: {count, responses: {[responseText]: count}}}}
 * Notes answers are counted per question only (each note is free text).
 */
const getSurveyUsage = async(detail) => {
    try {
        var survey = await Survey.findOne({_id: detail.surveyID}, {campaignIDs: 1})
        if(!survey) return {total: 0, questions: {}}

        var surveyID = String(detail.surveyID)

        // Answers can come from campaigns the survey is no longer loaded in, so also include
        // every campaign whose activities used it. Matching on campaignID keeps the
        // {campaignID, surveyResponse.surveyID} index in play.
        var activityCampaignIDs = await Activity.distinct('campaignID', {surveyID: surveyID})
        var campaignIDs = [...new Set([...(survey.campaignIDs || []), ...activityCampaignIDs])]
        var match = {campaignID: {$in: campaignIDs}, 'surveyResponse.surveyID': surveyID}

        var [total, rows] = await Promise.all([
            ActivityContactRecord.countDocuments(match),
            ActivityContactRecord.aggregate([
                {$match: match},
                {$unwind: '$surveyResponse.questionResponses'},
                {$group: {
                    _id: {
                        question: '$surveyResponse.questionResponses.question',
                        response: {$cond: [
                            {$eq: ['$surveyResponse.questionResponses.questionType', 'NOTES']},
                            null,
                            '$surveyResponse.questionResponses.response'
                        ]},
                    },
                    count: {$sum: 1},
                }},
            ]).allowDiskUse(true),
        ])

        var questions = {}
        rows.forEach(row => {
            var question = row._id.question
            if(question === undefined || question === null) return
            if(!questions[question]) questions[question] = {count: 0, responses: {}}
            questions[question].count += row.count
            if(row._id.response !== null && row._id.response !== undefined){
                questions[question].responses[row._id.response] = (questions[question].responses[row._id.response] || 0) + row.count
            }
        })

        return {total, questions}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getSurveyUsage}
