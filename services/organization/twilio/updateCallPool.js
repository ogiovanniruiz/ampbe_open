var Campaign = require('../../../models/campaigns/campaign')
var CallPool = require('../../../models/organizations/callPool')
var Activity = require('../../../models/activities/activity')

const five_minutes_in_ms = 5*1000*60

// Claims one number in a single atomic update, so two callers can never get the same one
const claim = (filter, date) => CallPool.findOneAndUpdate(
    filter,
    {$set: {available: false, dateUpdated: date}, $inc: {numCalls: 1}},
    {returnDocument: 'after'}
)

const updateCallPool = async(data) => {
    try {

        // No new calls for a deactivated activity (only checked when the caller sends activityID)
        if(data.activityID){
            var activity = await Activity.findById(data.activityID, {active: 1})
            if(!activity || activity.active === false){
                return {inactive: true}
            }
        }

        var campaign = await Campaign.findOne({campaignID:  data.campaignID})
        if(!campaign) return false

        // Campaigns funded by their creator org call from that org's pool
        var orgID = campaign.fundedByCreatorOrg ? campaign.creatorOrg : data.orgID

        var date = new Date();
        var staleBefore = new Date(date - five_minutes_in_ms)

        // Spread calls across the pool: try a random free number first, then any free one
        var [randomPick] = await CallPool.aggregate([{$match: {orgID: orgID, available: true}}, {$sample: {size: 1}}])
        var number = randomPick ? await claim({_id: randomPick._id, available: true}, date) : null
        if(!number) number = await claim({orgID: orgID, available: true}, date)
        if(number) return number

        // Reclaim a number held for more than five minutes (a caller that never released it)
        var reclaimed = await claim({orgID: orgID, available: false, dateUpdated: {$lte: staleBefore}}, date)
        if(reclaimed) return reclaimed

        return false
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {updateCallPool}
