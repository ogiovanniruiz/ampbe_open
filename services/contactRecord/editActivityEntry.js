var ActivityContactRecord = require('../../models/activities/activityContactRecord')
var Activity = require('../../models/activities/activity')
var Survey = require('../../models/surveys/survey')
var NonResponseSet = require('../../models/surveys/nonResponseSet')
var User = require('../../models/users/user')

const CHOICE_TYPES = ['SINGLESELECT', 'MULTISELECT']

// Nonresponses that finish a person in phonebanks and canvasses, as when they're submitted
const COMPLETING_NONRESPONSE_TYPES = ['DNC', 'INVALIDPHONE', 'INVALIDADDRESS']

// Corrects one survey response or nonresponse from the activity report. The entry can also switch
// between the two. Only the contact record changes (plus its edit history); household records,
// passes and locks are left as they are.
const editActivityEntry = async(detail) => {
    try {
        var hasSurvey = !!detail.surveyResponse, hasNonResponse = !!detail.nonResponse
        if(hasSurvey === hasNonResponse) return {error: 'Send either a survey response or a nonresponse.'}

        var record = await ActivityContactRecord.findOne({_id: detail.recordID, activityID: detail.activityID},
            {surveyResponse: 1, nonResponse: 1, complete: 1, activityType: 1}).lean()
        if(!record) return {error: 'This entry is no longer in the activity.'}
        if(!record.surveyResponse && !record.nonResponse) return {error: 'This entry has no response to edit.'}

        var activity = await Activity.findById(detail.activityID, {surveyID: 1, nonResponseSetID: 1, activityType: 1}).lean()
        if(!activity) return {error: 'The activity no longer exists.'}

        var set = {}, unset = {}

        if(hasSurvey){
            var survey = activity.surveyID ? await Survey.findById(activity.surveyID).lean() : null
            if(!survey) return {error: 'This activity has no survey.'}

            var questions = new Map((survey.questions || []).map(q => [q.question, q]))
            var questionResponses = []
            for(var answer of detail.surveyResponse.questionResponses || []){
                var question = questions.get(answer.question)
                if(!question) return {error: `"${answer.question}" isn't a question in this survey.`}
                var response = typeof answer.response === 'string' ? answer.response.trim() : ''
                if(!response) continue
                if(CHOICE_TYPES.includes(question.questionType) && !(question.responses || []).some(r => r.response === response)){
                    return {error: `"${response}" isn't an answer to "${question.question}".`}
                }
                questionResponses.push({question: question.question, questionType: question.questionType, response: response})
            }

            // Same rule as submitting: at least one multiple-choice answer
            if(!questionResponses.some(r => CHOICE_TYPES.includes(r.questionType))){
                return {error: 'Answer at least one multiple-choice question.'}
            }

            set.surveyResponse = {surveyID: String(survey._id), questionResponses: questionResponses}
            set.complete = true
            unset.nonResponse = ''
        } else {
            var nonResponseSet = activity.nonResponseSetID ? await NonResponseSet.findById(activity.nonResponseSetID).lean() : null
            var chosen = nonResponseSet && (nonResponseSet.nonResponses || []).find(n => n.nonResponse === detail.nonResponse.nonResponse)
            if(!chosen) return {error: `"${detail.nonResponse.nonResponse}" isn't a nonresponse for this activity.`}

            set.nonResponse = {nonResponseSetID: String(nonResponseSet._id), nonResponseType: chosen.nonResponseType, nonResponse: chosen.nonResponse}
            // Texting finishes a person on any response; calls and doors only on the completing types
            set.complete = (record.activityType || activity.activityType) === 'Texting' || COMPLETING_NONRESPONSE_TYPES.includes(chosen.nonResponseType)
            unset.surveyResponse = ''
        }

        var editor = detail.editorID ? await User.findById(detail.editorID, {'name.fullName': 1}).lean().catch(() => null) : null
        var edit = {
            editorID: detail.editorID || null,
            editorName: editor && editor.name ? editor.name.fullName : null,
            date: new Date(),
            before: {surveyResponse: record.surveyResponse || null, nonResponse: record.nonResponse || null, complete: !!record.complete},
        }

        await ActivityContactRecord.updateOne({_id: record._id, activityID: detail.activityID},
            {$set: set, $unset: unset, $push: {editHistory: edit}})

        return {record: await ActivityContactRecord.findById(record._id, {
            surveyResponse: 1, nonResponse: 1, complete: 1, editHistory: 1,
        }).lean()}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editActivityEntry}
