var Organization = require('../../models/organizations/organization')
var Campaign = require('../../models/campaigns/campaign')
var User = require('../../models/users/user')
var Activity = require('../../models/activities/activity')
var Group = require('../../models/groups/group')

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

const deleteCampaign = async(detail) => {
    try {
        var campaignID = Number(detail.campaignID)
        var campaign = await Campaign.findOne({campaignID}, {_id: 1})
        if(!campaign) return {success: false, msg: "This campaign no longer exists."}

        // Activities and groups point at the campaign; deleting it would orphan them
        var [activityCount, groupCount] = await Promise.all([
            Activity.countDocuments({campaignID}),
            Group.countDocuments({campaignID}),
        ])
        if(activityCount || groupCount){
            var parts = [activityCount && plural(activityCount, 'activity', 'activities'), groupCount && plural(groupCount, 'group', 'groups')].filter(Boolean)
            return {success: false, msg: `This campaign has ${parts.join(' and ')} and can't be deleted. Keep it deactivated instead.`}
        }

        await Campaign.deleteOne({campaignID});

        // Every org and data manager that referenced it, not only the ones the client listed
        await Organization.updateMany({campaignIDs: String(campaignID)}, {$pull: {campaignIDs: String(campaignID)}})
        await User.updateMany({dataManager: campaignID}, {$pull: {dataManager: campaignID}})

        return {success: true, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteCampaign}
