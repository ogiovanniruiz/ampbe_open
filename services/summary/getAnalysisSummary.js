const ActivityContactRecord = require('../../models/activities/activityContactRecord')
const Activity = require('../../models/activities/activity')
const { analyzeUniverseMongo } = require('./analysisUtil') // adjust path to wherever you save universeAnalysisMongo.js

const getAnalysisSummary = async(detail) => {

    var match = { campaignID: detail.campaignID}

    var activities = await Activity.find({campaignID: detail.campaignID, surveyID: detail.surveyID})
    var activityIDs = activities.map(activity => String(activity._id))

    match.activityID = {$in: activityIDs}

    const summary = await analyzeUniverseMongo(ActivityContactRecord, { match })

    return summary

}

module.exports = {getAnalysisSummary}