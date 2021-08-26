var Precincts = require('../../models/targets/precinct')
const getPrecincts = async(detail) => {
    try {

        var precinctID = '';

        if(detail.precinctIDS){
            precinctID = { $in: detail.precinctIDS }
        }

        const agg = [
            { '$match': {
                    //"properties.precinctID": precinctID ? precinctID : { $exists: true },
                    '$or': [{
                        'properties.registered': { '$elemMatch': { 'campaignID': detail.campaignID } }
                    }, {
                        'properties.locked': { '$elemMatch': { 'campaignID': detail.campaignID } }
                    }]
                }}
        ];
        return await Precincts.aggregate(agg);
     
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPrecincts}
