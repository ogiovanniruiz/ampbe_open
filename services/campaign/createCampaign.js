var Organization = require('../../models/organizations/organization');
var Campaign = require('../../models/campaigns/campaign');
var Districts = require('../../models/campaigns/districts');
var States = require('../../models/campaigns/states');
var Blockgroups = require('../../models/targets/blockgroup');
var Precincts = require('../../models/targets/precinct');
var User = require('../../models/users/user')

const createCampaign = async(newCampaignDetail) => {
    try { 
        var foundCampaign = await Campaign.findOne({name: newCampaignDetail.name})
        if(foundCampaign){
            return {success: false, msg: "Campaign with that name already exists."}
        }

        var boundary = await Districts.find({'_id': {$in: newCampaignDetail.boundaryID}});

        var campaignDetail = {name: newCampaignDetail.name,
                              description: newCampaignDetail.description,
                              orgIDs: [newCampaignDetail.orgID],
                              dataManagers: [newCampaignDetail.userID],
                              boundary: boundary,
                              electionType: newCampaignDetail.electionType,
                              fundedByCreatorOrg: newCampaignDetail.fundedByCreatorOrg,
                              creatorOrg: newCampaignDetail.orgID,
                              geographical: newCampaignDetail.geographical
                             };

        var campaign = new Campaign(campaignDetail);
        await campaign.save();

        var user = await User.findById(newCampaignDetail.userID)
        user.dataManager.push(campaign.campaignID)
        await user.save()

        var org = await Organization.findById(newCampaignDetail.orgID);
        org.campaignIDs.push(campaign.campaignID);
        await org.save()

        return {success: true, campaign: campaign, org: org, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createCampaign}
