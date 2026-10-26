var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')
var Activity = require('../../../models/activities/activity')
var ActivityContactRecord = require('../../../models/activities/activityContactRecord')

/**
 * How many contacts were recorded with each response of a non-response set.
 * Records store the response text and type, so used responses must keep both
 * or the summary splits and group filters stop matching past contacts.
 *
 * Returns {total, responses: {[text]: count}}
 */
const getNonResponseSetUsage = async(detail) => {
    try {
        var setID = String(detail.nonResponseSetID)

        // Campaigns the set belongs to, plus campaigns of activities using it (it may have been
        // removed from one since). Deleted activities keep their records, so match by campaign.
        var set = await NonResponseSet.findById(setID, {campaignIDs: 1}).lean()
        var activityCampaignIDs = await Activity.distinct('campaignID', {nonResponseSetID: setID})
        var campaignIDs = [...new Set([...(set?.campaignIDs || []), ...activityCampaignIDs].filter(id => id !== null && id !== undefined))]
        if(!campaignIDs.length) return {total: 0, responses: {}}

        var rows = await ActivityContactRecord.aggregate([
            {$match: {campaignID: {$in: campaignIDs}, 'nonResponse.nonResponseSetID': setID}},
            {$group: {_id: '$nonResponse.nonResponse', count: {$sum: 1}}},
        ]).allowDiskUse(true)

        var responses = {}
        var total = 0
        rows.forEach(row => {
            total += row.count
            if(row._id !== null && row._id !== undefined) responses[row._id] = row.count
        })

        return {total, responses}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getNonResponseSetUsage}
