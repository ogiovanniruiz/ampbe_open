var Survey = require('../../models/surveys/survey.js')
var Activity = require('../../models/activities/activity')
var { getSurveyUsage } = require('./getSurveyUsage')

const activities = (n) => n === 1 ? '1 activity' : `${n.toLocaleString()} activities`
const answers = (n) => n === 1 ? '1 recorded answer' : `${n.toLocaleString()} recorded answers`

const removeSurvey = async(survey) => {
    try { 
        var surveyID = String(survey._id)

        // Activities load their survey by ID: deleting one in use leaves volunteers with no questions
        var activityCount = await Activity.countDocuments({surveyID: surveyID})
        if(activityCount > 0){
            return {success: false, msg: `This survey is used by ${activities(activityCount)} and can't be deleted. Keep it archived instead.`}
        }

        // Summaries build their columns from the survey, so past answers would become unreadable
        var usage = await getSurveyUsage({surveyID: surveyID})
        if(usage.total > 0){
            return {success: false, msg: `This survey has ${answers(usage.total)} and can't be deleted. Keep it archived instead.`}
        }

        var result = await Survey.deleteOne({_id: survey._id});
        return {success: result.deletedCount > 0, msg: result.deletedCount > 0 ? 'Deleted.' : 'This survey no longer exists.'}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeSurvey}
