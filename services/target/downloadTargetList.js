var Membership = require('../../models/organizations/membership')
var Campaign = require('../../models/campaigns/campaign')
var HouseHold = require('../../models/houseHolds/houseHold')
var People = require('../../models/people/people')

var Campaign = require('../../models/campaigns/campaign')

var Districts = require('../../models/campaigns/districts');

var convertQueriesHousehold = require('./convertQueriesHousehold')
var convertQueriesIndividual = require('./convertQueriesIndividual')
var convertQueriesMembership = require('./convertQueriesMembership')

var ExtractScriptResponses = require('./extractScriptResponses')

var Target = require('../../models/targets/target')

const downloadTargetList = async(activity) => {
    console.log(activity)
    try {
        var target = await Target.findOne({_id: activity.targetID })
        var campaign = await Campaign.findOne({campaignID: activity.campaignID})

        var excludedObjects = []

        var filter = {}

        // Build filter
        if(target.properties.queries){

            var queries = await ExtractScriptResponses.extractScriptResponses(target.properties.queries, activity.campaignID, activity.orgIDs[0])
            
            if(target.properties.idByHousehold === 'HOUSEHOLD'){
                filter = await convertQueriesHousehold.convertQueriesHousehold(queries)
            } else if (target.properties.idByHousehold === 'INDIVIDUAL'){
                filter = await convertQueriesIndividual.convertQueriesIndividual(queries)
            } else{
                filter = await convertQueriesMembership.convertQueriesMembership(queries)
            } 
        }


        // Add district type
        var districtType = {};
        var districtTypeSet = [];

        var boundary = await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs}})
        var districtTypeParam = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
        for(var i = 0; i < boundary.length; i++){
            var id = boundary[i].properties.identifier
            districtTypeSet.push(id);
        }
        districtType[districtTypeParam] = {$in: districtTypeSet}

        /*
        var phoneFilter = {$match: {}}
        //if(activity.activityType === "Phonebank" || activity.activityType === "Texting"){
            phoneFilter = {$project:{
                '_id': 1, 
                'resident': {
                    "$filter": {
                        "input": "$resident",
                        "as": "resident",
                        "cond": {"$or":[{ "$ne" : [ "$$resident.phones", [] ] }, { "$ne" : [ "$$resident.emails", [] ] }]}
                    }
                }
            }}
        //}*/

        //exclusion filter
        var exclusionFilter  = {$match: {}}

        if(excludedObjects.length > 0){
            exclusionFilter = {$project:{
                '_id': 1, 
                'residents': {
                    "$filter": {
                        "input": "$residents",
                        "as": "residents",
                        "cond": {"$and": excludedObjects}
                    }
                }, 
            }}
        }

        // Build Query
        if(target.properties.idByHousehold === 'HOUSEHOLD'){
            agg = [
                {$match: filter},
                {$match: districtType},
                //phoneFilter,
                exclusionFilter,
                {$match: { 'residents.0': { $exists: true } }},
                {$limit : 500000},
                {$project: {
                    _id: 0,
                    houseHold: '$$ROOT',
                    date: { $toDate: Date.now() },
                 }},

            ]

            return await HouseHold.aggregate(agg).allowDiskUse(true)
        }else if (target.properties.idByHousehold === 'INDIVIDUAL'){

            agg = [
                {$match: filter},
                {$match: districtType},
                {$match: {"$or":[{  "resident.phones": {$ne: []}  }, 
                                 { "resident.emails": {$ne: []}} ]}},
                {$project: {name: '$resident.name',
                            phones: '$resident.phones',
                            emails: '$resident.emails'
            }}
            ]

            return await People.aggregate(agg).allowDiskUse(true)

        }else if (target.properties.idByHousehold === 'MEMBERSHIP'){
            
            agg = [
                {$match: {'resident.orgID': activity.orgIDs[0]}},
                {$match: filter},
                {
                    $group: {
                        _id: {
                            address:'$address.address',
                            city:'$address.city',
                            state:'$address.state',
                            zip:'$address.zip',
                        },
                        residents: {$push:  '$resident'},
                    }
                },
                phoneFilter,
                exclusionFilter,
                {$match: { 'residents.0': { $exists: true } }},
                {$limit : 500000},
                {$project: {
                        _id: 0,
                        houseHold: '$$ROOT',
                        date: { $toDate: Date.now() },
                }},
                
            ]
            
            return await Membership.aggregate(agg).allowDiskUse(true)
        }


    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {downloadTargetList}
