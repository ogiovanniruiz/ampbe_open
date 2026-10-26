var Activity = require('../../models/activities/activity')
var Campaign = require('../../models/campaigns/campaign')

const getActivities = async(details) => {
    try {
        var query = details

        // The campaign's creator org gets every activity in the campaign, not just the ones it's in
        if(details.campaignID != null && details.orgIDs){
            var campaign = await Campaign.findOne({campaignID: details.campaignID}, {creatorOrg: 1}).lean()
            if(campaign && campaign.creatorOrg === details.orgIDs){
                query = {...details}
                delete query.orgIDs
            }
        }

        return await Activity.find(query).sort({ name: 1 });
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getActivities}
