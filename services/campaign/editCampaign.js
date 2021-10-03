var Campaign = require('../../models/campaigns/campaign');

const editCampaign = async(data) => {
    try {

        var campaign = await Campaign.findOne({campaignID: data.campaignID})

        if(data.command === 'edit'){

            var existingCampaign = await Campaign.findOne({name: data.name})
            if(existingCampaign && (existingCampaign.name != data.name)){
                return{success: false, msg: "Campaign with that name already exists."}
            }

            campaign.name = data.name;
            campaign.description = data.description;

            if(data.editData.boundaryType) {

                campaign.boundaryIDs = data.editData.boundaryID
                campaign.electionType = data.editData.editElectionType;
                campaign.geographical = data.editData.geographical;
                campaign.fundedByCreatorOrg = data.editData.fundedByCreatorOrg;
            }

        }

        if (data.command === 'activate'){
            campaign.active = true
        }

        if(data.command === 'deactivate'){
            campaign.active = false
        }

        campaign.save();

        return {success: true, msg: "Success."}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editCampaign}
