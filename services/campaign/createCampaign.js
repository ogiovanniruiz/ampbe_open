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

        if(newCampaignDetail.boundaryType !== 'NONE') {
            var boundary = {};
            if (newCampaignDetail.boundaryType === 'DISTRICT') {
                boundary = await Districts.find({'_id': {$in: newCampaignDetail.boundaryID}});
            } else {
                boundary = await States.find({'_id': {$in: newCampaignDetail.boundaryID}});
            }

            var geoboundary = []
            for (var i = 0; i < boundary.length; i++) {
                await geoboundary.push(boundary[i].geometry.coordinates[0]);
            }

            const aggBlockgroups = [
                {
                    '$match': {
                        'geometry': {
                            $geoIntersects: {'$geometry': {type: 'MultiPolygon', coordinates: geoboundary}}
                        }
                    }
                }, {
                    '$group': {
                        '_id': null,
                        'ids': {
                            '$push': '$properties.geoid'
                        }
                    }
                }
            ];
            var targetsBlockgroupIDS = await Blockgroups.aggregate(aggBlockgroups);

            const aggPrecincts = [
                {
                    '$match': {
                        'geometry': {
                            $exists: true
                        },
                        'geometry': {
                            $geoIntersects: {'$geometry': {type: 'MultiPolygon', coordinates: geoboundary}}
                        }
                    }
                }, {
                    '$group': {
                        '_id': null,
                        'ids': {
                            '$push': '$properties.precinctID'
                        }
                    }
                }
            ];
            var targetsPrecinctIDS = await Precincts.aggregate(aggPrecincts);
        } else {
            var targetsBlockgroupIDS = [];
            var targetsPrecinctIDS = [];

            var boundary = {
                properties : {
                    name: "NONE",
                    state: { name: "CALIFORNIA", abbrv: "CA" },
                    districtType: "NONE",
                    identifier: "CA_NONE_NONE",
                },
                type : 'Feature',
            };
        }

        var campaignDetail = {name: newCampaignDetail.name,
                              description: newCampaignDetail.description,
                              orgIDs: [newCampaignDetail.orgID],
                              dataManagers: [newCampaignDetail.userID],
                              boundary: boundary,
                              electionType: newCampaignDetail.electionType,
                              fundedByCreatorOrg: newCampaignDetail.fundedByCreatorOrg,
                              creatorOrg: newCampaignDetail.orgID,
                              geographical: newCampaignDetail.geographical,
                              blockgroupIDS: targetsBlockgroupIDS.length ? targetsBlockgroupIDS[0].ids : [],
                              precinctIDS: targetsPrecinctIDS.length ? targetsPrecinctIDS[0].ids : []
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
