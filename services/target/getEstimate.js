var Campaign = require('../../models/campaigns/campaign')
var HouseHold = require('../../models/houseHolds/houseHold')
var People = require('../../models/people/people')
var convertQueriesHousehold = require('./convertQueriesHousehold')
var convertQueriesIndividual = require('./convertQueriesIndividual')
var convertQueriesMembership = require('./convertQueriesMembership')
var ExtractScriptResponses = require('./extractScriptResponses')
var OutReachReport = require('../../models/campaigns/outreachReport')
var Membership = require('../../models/organizations/membership')

const getEstimate = async(estimate) => {
    try { 
        
        var campaign = await Campaign.findOne({campaignID: estimate.campaignID})

        var outReachReport = await OutReachReport.find({campaignID: estimate.campaignID, orgID: estimate.orgID})

        var filter = {}
        if(estimate.queries){
            var queries = await ExtractScriptResponses.extractScriptResponses(estimate.queries, outReachReport)

            

            if(estimate.idByHousehold === 'HOUSEHOLD'){
                filter = await convertQueriesHousehold.convertQueriesHousehold(queries)
            } else if (estimate.idByHousehold === 'INDIVIDUAL'){
                filter = await convertQueriesIndividual.convertQueriesIndividual(queries)
            } else{
                filter = await convertQueriesMembership.convertQueriesMembership(queries)
            }

            console.log(filter)
        }

        var districtType = {};
        var districtTypeSet = [];
        if(campaign.boundary[0].properties.districtType && campaign.boundary[0].properties.districtType !== "NONE"){
            var districtTypeParam = await "districts." + campaign.boundary[0].properties.districtType.toLowerCase() + "ID";
            for(var i = 0; i < campaign.boundary.length; i++){
                var id = campaign.boundary[i].properties.identifier
                await districtTypeSet.push(id);
            }
            districtType[districtTypeParam] = await { $in: districtTypeSet}
        }else{
            //districtType['_id.state.name'] = campaign.boundary.properties.state.name
        }

        if(estimate.idByHousehold === 'HOUSEHOLD'){
            agg = [
                {$match: districtType},
                {$match: filter},
            ]

            var houseHolds = await HouseHold.aggregate(agg).allowDiskUse(true).limit(500000)
        } else if (estimate.idByHousehold === 'INDIVIDUAL'){
            agg = [
                {$match: districtType},
                {$match: filter},
                {
                    '$group': {
                        '_id': {
                            'streetNum':'$address.streetNum',
                            'prefix':'$address.prefix',
                            'street':'$address.street',
                            'suffix':'$address.suffix',
                            'unit':'$address.unit',
                            'city':'$address.city',
                            'state':'$address.state',
                            'zip':'$address.zip',
                        },
                        'residents': {
                            '$push': '$resident'
                        }
                    }
                }
            ]

            var houseHolds = await People.aggregate(agg).allowDiskUse(true).limit(500000)
        } else{

            agg = [
                {$match: {'resident.orgID': estimate.orgID}},
                //{$match: districtType},
                {$match: filter},
                {
                    '$group': {
                        '_id': {
                            'address':'$address',
                            'city':'$city',
                            'state':'$state',
                            'zip':'$zip',
                        },
                        'residents': {
                            '$push': '$resident'
                        }
                    }
                }
            ]

            var houseHolds = await Membership.aggregate(agg).allowDiskUse(true).limit(500000)

        }

        var totalResidents = 0

        for(var i = 0; i < houseHolds.length; i++){
            totalResidents = totalResidents + houseHolds[i].residents.length
        }

        return {totalHouseHolds: houseHolds.length, totalResidents: totalResidents, filter: filter, houseHolds: houseHolds}
    
    } catch(e){
        throw new Error(e.message)
    }
}


module.exports = {getEstimate}
