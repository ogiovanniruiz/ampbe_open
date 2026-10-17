var Campaign = require('../../models/campaigns/campaign');
var Activity = require('../../models/activities/activity')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const editCampaign = async(data) => {
    try {

        var campaign = await Campaign.findOne({campaignID: data.campaignID})
        if(!campaign) return {success: false, msg: "This campaign no longer exists."}

        if(data.command === 'edit'){
            var name = (data.name || '').trim().replace(/\s+/g, ' ')
            if(!name) return {success: false, msg: "Campaign needs a name."}

            // Another campaign with the same name (case-insensitive)
            var existingCampaign = await Campaign.findOne({campaignID: {$ne: campaign.campaignID}, name: {$regex: `^${escapeRegex(name)}$`, $options: 'i'}}, {_id: 1})
            if(existingCampaign){
                return{success: false, msg: "Campaign with that name already exists."}
            }

            campaign.name = name;
            campaign.description = data.description;
            campaign.sleep = data.editData.sleep
            campaign.showNearestPollingLocations = data.editData.showNearestPollingLocations
            campaign.showPartisan = data.editData.showPartisan

            if(data.editData.boundaryType) {
                campaign.boundaryIDs = data.editData.boundaryID
                campaign.electionType = data.editData.editElectionType;
                campaign.geographical = data.editData.geographical;
                campaign.fundedByCreatorOrg = data.editData.fundedByCreatorOrg;
                campaign.textingFundedByCreatorOrg = data.editData.textingFundedByCreatorOrg
                campaign.electionYear = data.editData.electionYear
            }

        }

        if (data.command === 'activate'){
            campaign.active = true
        }

        if(data.command === 'deactivate'){

            var activities = await Activity.find({campaignID: data.campaignID, active: true});

            if(activities.length > 0){

                let acttivityNames = activities.map(activity => activity.name).join(", ")
                return {success: false, msg: `WARNING: There are still active Activities on this Campaign: ${acttivityNames}. Please deactivate all Activities.`}
            }

            campaign.active = false
        }

        await campaign.save();

        return {success: true, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editCampaign}
