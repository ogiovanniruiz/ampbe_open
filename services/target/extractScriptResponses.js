var Blockgroups = require('../../models/targets/blockgroup')
var Precincts = require('../../models/targets/precinct')
var OutReachReport = require('../../models/campaigns/outreachReport')

const extractScriptResponses = async(queries, campaignID, orgID) =>{

    if(queries.rules.length < 1){
        return queries
    }

    for(var i = 0; i < queries.rules.length; i++){
        queries.rules[i].personIDs = [];

        if(queries.rules[i].field === 'scripts' && queries.rules[i].value){
            var outReachReport = await OutReachReport.find({campaignID: campaignID, orgID: orgID, scriptResponse: {$exists: true}})
            
            for(var k = 0; k < queries.rules[i].value.length; k++){

                var scriptID = queries.rules[i].value[k]._id;
                var question = queries.rules[i].value[k].question;
                var response = queries.rules[i].value[k].response;

                var targetOutReachEntries = outReachReport.filter(
                    outReachEntry => 
                        outReachEntry['scriptResponse'] &&
                        outReachEntry['scriptID'] === scriptID &&
                        outReachEntry['scriptResponse']['questionResponses'] &&
                        outReachEntry['scriptResponse']['questionResponses'].some(
                            questionResponse => questionResponse.response === response &&
                                                questionResponse.question === question
                        )
                );
                
                for(var j = 0; j < targetOutReachEntries.length; j++ ){
                    queries.rules[i].personIDs.push(targetOutReachEntries[j].personID)
                }

            }
        }

        if(queries.rules[i].field === 'nonResponseSets' && queries.rules[i].value){
            var outReachReport = await OutReachReport.find({campaignID: campaignID, orgID: orgID, nonResponse: {$exists: true}})
            for(var k = 0; k < queries.rules[i].value.length; k++){
                var nonResponseSetID = queries.rules[i].value[k]._id;
                var nonResponseType = queries.rules[i].value[k].nonResponseType;

                var targetOutReachEntries = outReachReport.filter(
                    outReachEntry => 
                        outReachEntry['nonResponse'] &&
                        outReachEntry['nonResponse']['nonResponseSetID'] === nonResponseSetID &&
                        outReachEntry['nonResponse']['nonResponseType'] === nonResponseType
                );

                for(var j = 0; j < targetOutReachEntries.length; j++ ){
                    queries.rules[i].personIDs.push(targetOutReachEntries[j].personID)
                 }
            }
        }


        if(queries.rules[i].field === 'blockgroups'){

            const aggBG = [
                {'$match': {'properties.geoid': {'$in': queries.rules[i].value}}},
                {'$group': {'_id': null, 'targets': {'$addToSet': {'$arrayElemAt': ['$geometry.coordinates', 0]}}}}
            ];

            var geometry = await Blockgroups.aggregate(aggBG);
            queries.rules[i].geometry.coordinates = await geometry[0].targets;

        }


        if(queries.rules[i].field === 'precincts'){

            const aggPrec = [
                {'$match': {'properties.precinctID': {'$in': queries.rules[i].value}}},
                {'$group': {'_id': null, 'targets': {'$addToSet': {'$arrayElemAt': ['$geometry.coordinates', 0]}}}}
            ];

            var geometry = await Precincts.aggregate(aggPrec);
            queries.rules[i].geometry.coordinates = await geometry[0].targets;

        }

    }

    return queries

}

module.exports = {extractScriptResponses}
