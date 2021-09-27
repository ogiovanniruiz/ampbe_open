var Campaign = require('../../models/campaigns/campaign');
var Districts = require('../../models/campaigns/districts');
var States = require('../../models/campaigns/states');
var Blockgroups = require('../../models/targets/blockgroup');
var Precincts = require('../../models/targets/precinct');

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

            var boundary = await Districts.find({'_id': {$in: data.editData.boundaryID}});


            if(data.editData.boundaryType) {
                campaign.boundary = boundary;
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
