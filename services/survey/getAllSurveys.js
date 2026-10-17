var Survey = require('../../models/surveys/survey.js')
var Activity = require('../../models/activities/activity')

const getAllSurveys = async(detail) => {
    try { 
        var surveys = await Survey.find({$or: [{"orgID": detail.orgID}, {campaignIDs: detail.campaignID}]}).sort({name: 1}).lean();

        // How many activities use each survey, so the UI can warn before archiving or deleting
        var ids = surveys.map(survey => String(survey._id))
        var usage = ids.length ? await Activity.aggregate([
            {$match: {surveyID: {$in: ids}}},
            {$group: {_id: '$surveyID', count: {$sum: 1}}}
        ]) : []
        var counts = new Map(usage.map(u => [String(u._id), u.count]))

        return surveys.map(survey => ({...survey, activityCount: counts.get(String(survey._id)) || 0}))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllSurveys}
