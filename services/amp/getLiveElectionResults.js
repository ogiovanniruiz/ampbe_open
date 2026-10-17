
const GetSBResults = require('./getLiveSBResults')
const GetLiveRiversideResults = require('./getLiveRiversideResults')
const GetLiveSOSResults = require('./getLiveSOSResults')

const getLiveElectionResults = async(data) => {

    let sbResults = await GetSBResults.getLiveSBResults(data);
    let riversideResults = await GetLiveRiversideResults.getLiveRiversideResults(data);
    let sosResults = await GetLiveSOSResults.getLiveSOSResults(data);

    let results = {sbResults: sbResults, riversideResults: riversideResults, sosResults: sosResults}



    return results;

}

module.exports = {getLiveElectionResults}