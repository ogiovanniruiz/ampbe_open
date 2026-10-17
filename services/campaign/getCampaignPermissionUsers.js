var Campaign = require('../../models/campaigns/campaign')
var User = require('../../models/users/user')

// Only what the permissions dialog shows; never the whole user record
const PERMISSION_USER_FIELDS = {name: 1, loginEmail: 1, dataManager: 1, orgPermissions: 1}

/**
 * Admins and owners of the organizations on a campaign: the people who can be
 * made data managers for it. Replaces fetching every user in the system.
 */
const getCampaignPermissionUsers = async(details) => {
    try {
        var campaign = await Campaign.findOne({campaignID: details.campaignID}, {orgIDs: 1})
        if(!campaign || !campaign.orgIDs?.length) return []

        return await User.find(
            {orgPermissions: {$elemMatch: {orgID: {$in: campaign.orgIDs}, level: {$ne: 'VOLUNTEER'}}}},
            PERMISSION_USER_FIELDS
        ).sort({'name.lastName': 1, 'name.firstName': 1})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignPermissionUsers, PERMISSION_USER_FIELDS}
