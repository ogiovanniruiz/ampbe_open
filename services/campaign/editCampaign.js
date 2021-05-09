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

            if(data.editData.boundaryType && data.editData.boundaryType !== 'NONE') {
                var boundary = {};
                if (data.editData.boundaryType === 'DISTRICT') {
                    boundary = await Districts.find({'_id': {$in: data.editData.boundaryID}});
                } else {
                    boundary = await States.find({'_id': {$in: data.editData.boundaryID}});
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
                                $geoIntersects: {'$geometry': {type: 'MultiPolygon', coordinates: geoboundary}},
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
            }

            if(data.editData.boundaryType === 'NONE') {
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

            if(data.editData.boundaryType) {
                campaign.boundary = boundary;
                campaign.electionType = data.editData.editElectionType;
                campaign.geographical = data.editData.geographical;
                campaign.fundedByCreatorOrg = data.editData.fundedByCreatorOrg;
                campaign.blockgroupIDS = targetsBlockgroupIDS.length ? targetsBlockgroupIDS[0].ids : [];
                campaign.precinctIDS = targetsPrecinctIDS.length ? targetsPrecinctIDS[0].ids : [];
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
