var Campaign = require('../../models/campaigns/campaign')
var Target = require('../../models/targets/target')
var convertQueriesHousehold = require('./convertQueriesHousehold')
var convertQueriesIndividual = require('./convertQueriesIndividual')
var convertQueriesMembership = require('./convertQueriesMembership')
var ExtractScriptResponses = require('./extractScriptResponses')
var TextRecord = require('../../models/activities/textbank/textRecords')
var OutReachReport = require('../../models/campaigns/outreachReport')


const generateTargetResults = async(activity) => {
    try { 
        var target = await Target.findOne({_id: activity.targetID })
        var campaign = await Campaign.findOne({campaignID: activity.campaignID})

        var excludedObjects = []

        var passed = {};
        if(activity.activityType === 'Texting'){
            var invalidPhones = await TextRecord.find({$or: [{deviceType: {$ne: 'mobile'}}, {error: true}]})

            for(var i = 0; i < invalidPhones.length; i++){
                excludedObjects.push({$ne: ["$$residents._id", invalidPhones[i].personID]})
            }
        }

        if(activity.activityType === 'Phonebank'){
            var passed = { $toBool: false };
        }

        if(activity.activityType === 'Texting' || activity.activityType === 'Phonebank' ){
            var outReachReport = await OutReachReport.find({campaignID: activity.campaignID, orgID: activity.orgIDs})

            for(var i = 0; i < outReachReport.length; i++){
                if(outReachReport[i].nonResponse && (outReachReport[i].nonResponse.nonResponseType === 'INVALIDPHONE' || outReachReport[i].nonResponse.nonResponseType === 'DNC')){
                    excludedObjects.push({$ne: ["$$residents._id", outReachReport[i].personID]})
                }
            }
        }

        var filter = {}

        // Build filter
        if(target.properties.queries){

            var queries = await ExtractScriptResponses.extractScriptResponses(target.properties.queries, outReachReport)
            
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
        if(campaign.boundary[0].properties.districtType && campaign.boundary[0].properties.districtType !== "NONE"){
            var districtTypeParam = await "districts." + campaign.boundary[0].properties.districtType.toLowerCase() + "ID"
            for(var i = 0; i < campaign.boundary.length; i++){
                var id = campaign.boundary[i].properties.identifier
                await districtTypeSet.push(id);
            }
            districtType[districtTypeParam] = await { $in: districtTypeSet}
        }

        // Remove empty phone numbers and landlines
        var phoneFilter = {$match: {}}

        if(activity.activityType === "Phonebank" || activity.activityType === "Texting"){
            phoneFilter = {$project:{
                '_id': 1, 
                'residents': {
                    "$filter": {
                        "input": "$residents",
                        "as": "residents",
                        "cond": {"$and":[{ "$ne" : [ "$$residents.phones", [] ] }]}
                    }
                }, 
                'location': 1,
                'fullAddress1': 1,
                'fullAddress2': 1,
                'blockgroupID': 1,
                'precinctID': 1,
                'districts': 1,
            }}
        }

        //exclusion filter
        var exclusionFilter  = {$match: {}}
        var excludedObjects = []

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
                'location': 1,
                'fullAddress1': 1,
                'fullAddress2': 1,
                'blockgroupID': 1,
                'precinctID': 1,
                'districts': 1,
            }}
        }

        // Build Query
        if(target.properties.idByHousehold === 'HOUSEHOLD'){

            agg = [
                {$match: filter},
                {$match: districtType},
                phoneFilter,
                exclusionFilter,
                {$match: { 'residents.0': { $exists: true } }},
                {$limit : 500000},
                
                {$project: {
                    _id: 0,
                    activityID: activity._id.toString(),
                    houseHold: '$$ROOT',
                    complete: {
                        '$cond': {
                            'if': {'$eq': [activity.activityType, 'Phonebank']},
                            'then': {'$toBool': false},
                            'else': '$$REMOVE'
                        }
                    },
                    passed: {
                        '$cond': {
                            'if': {'$eq': [activity.activityType, 'Phonebank']},
                            'then': {'$toBool': false},
                            'else': '$$REMOVE'
                        }
                    },
                    residentStatus: {
                        '$cond': {
                            'if': {'$eq': [activity.activityType, 'Phonebank']},
                            'then': [],
                            'else': '$$REMOVE'
                        }
                    },
                    //numResContacted: 0,
                    date: { $toDate: Date.now() },
                 }},

            ]

            return {'agg': agg, 'idByHousehold': target.properties.idByHousehold}
        } else if (target.properties.idByHousehold === 'INDIVIDUAL'){

            agg = [
                {$match: filter},
                {$match: districtType},
                {
                    $group: {
                        _id: {
                            streetNum:'$address.streetNum',
                            prefix:'$address.prefix',
                            street:'$address.street',
                            suffix:'$address.suffix',
                            unit:'$address.unit',
                            city:'$address.city',
                            state:'$address.state',
                            zip:'$address.zip',
                        },
                        fullAddress1: {$first: '$fullAddress1'},
                        fullAddress2: {$first: '$fullAddress2'},
                        residents: {$push:  '$resident'},
                        location: {$first: '$location'},
                        hhParties: {$first: '$hhParties'},
                        districts: {$first: '$districts'},
                        blockgroupID: {$first: '$blockgroupID'},
                        precinctID: {$first: '$precinctID'}
                    }
                },
                phoneFilter,
                exclusionFilter,
                {$match: { 'residents.0': { $exists: true } }},
                {$limit : 500000},
                {$project: {
                        _id: 0,
                        activityID: activity._id.toString(),
                        houseHold: '$$ROOT',
                        complete: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': {'$toBool': false},
                                'else': '$$REMOVE'
                            }
                        },
                        passed: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': {'$toBool': false},
                                'else': '$$REMOVE'
                            }
                        },
                        residentStatus: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': [],
                                'else': '$$REMOVE'
                            }
                        },
                        //numResContacted: 0,
                        date: { $toDate: Date.now() },
                }},
            ]
    
            return {'agg': agg, 'idByHousehold': target.properties.idByHousehold}
    

        } else if (target.properties.idByHousehold === 'MEMBERSHIP'){
            
            agg = [
                {$match: {'resident.orgID': activity.orgIDs[0]}},
                {$match: filter},
                //{$match: districtType},
                {
                    $group: {
                        _id: {
                            address:'$address.address',
                            city:'$address.city',
                            state:'$address.state',
                            zip:'$address.zip',
                        },
                        fullAddress1: {$first: '$fullAddress1'},
                        fullAddress2: {$first: '$fullAddress2'},
                        residents: {$push:  '$resident'},
                        location: {$first: '$location'},
                        districts: {$first: '$districts'},
                        blockgroupID: {$first: '$blockgroupID'},
                        precinctID: {$first: '$precinctID'}
                    }
                },
                phoneFilter,
                exclusionFilter,
                {$match: { 'residents.0': { $exists: true } }},
                {$limit : 500000},
                {$project: {
                        _id: 0,
                        activityID: activity._id.toString(),
                        houseHold: '$$ROOT',
                        complete: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': {'$toBool': false},
                                'else': '$$REMOVE'
                            }
                        },
                        passed: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': {'$toBool': false},
                                'else': '$$REMOVE'
                            }
                        },
                        residentStatus: {
                            '$cond': {
                                'if': {'$eq': [activity.activityType, 'Phonebank']},
                                'then': [],
                                'else': '$$REMOVE'
                            }
                        },
                        //numResContacted: 0,
                        date: { $toDate: Date.now() },
                }},
            ]
            //console.log(JSON.stringify(agg, null, 2))
            return {'agg': agg, 'idByHousehold': target.properties.idByHousehold}
        }
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {generateTargetResults}
