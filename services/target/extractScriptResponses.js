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
            

            var scriptIDs = []

            for(var l = 0; l < queries.rules[i].value.length; l++){
                scriptIDs.push(queries.rules[i].value[l]._id)
            }

            var outReachReport = await OutReachReport.find({orgID: orgID, scriptResponse: {$exists: true}, scriptID: {$in: scriptIDs}})

            for(var k = 0; k < queries.rules[i].value.length; k++){

                var question = queries.rules[i].value[k].question;
                var response = queries.rules[i].value[k].response;

                var targetOutReachEntries = outReachReport.filter(
                    outReachEntry => 
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

        //console.log(queries)

        if(queries.rules[i].field === 'nonResponseSets' && queries.rules[i].value){

            var nonresponseSetIDs = []

            for(var l = 0; l < queries.rules[i].value.length; l++){
                nonresponseSetIDs.push(queries.rules[i].value[l]._id)
            }

            var nonResponses = []

            for(var l = 0; l < queries.rules[i].value.length; l++){
                nonResponses.push(queries.rules[i].value[l].nonResponse)
            }


            var outReachReport = await OutReachReport.find({orgID: orgID, 
                                                            nonResponse: {$exists: true}, 
                                                            'nonResponse.nonResponseSetID': {$in: nonresponseSetIDs},
                                                            'nonResponse.nonResponse': {$in: nonResponses}
                                                        
                                                        })
            

            for(var k = 0; k < queries.rules[i].value.length; k++){

                for(var j = 0; j < outReachReport.length; j++ ){
                    queries.rules[i].personIDs.push(outReachReport[j].personID)
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
