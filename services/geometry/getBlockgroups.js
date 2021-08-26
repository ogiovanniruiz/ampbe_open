var Blockgroups = require('../../models/targets/blockgroup')
const getBlockgroups = async(detail) => {
    try {

        var geoid = '';
        if(detail.blockgroupIDS){
            geoid = { $in: detail.blockgroupIDS }
        }

        const agg = [
            { '$match': {
                //"properties.geoid": geoid ? geoid : { $exists: true },
                '$or': [{
                    'properties.registered': { '$elemMatch': { 'campaignID': detail.campaignID } }
                }, {
                    'properties.locked': { '$elemMatch': { 'campaignID': detail.campaignID } }
                }]
            }}
        ];
        return await Blockgroups.aggregate(agg);
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getBlockgroups}
