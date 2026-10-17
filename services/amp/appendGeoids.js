const Blockgroup = require('../../models/shapes/blockgroup')
const Household = require('../../models/households/household')
const Precinct = require('../../models/shapes/registrationPrecinct')

const appendGeoids = async() => {
    try { 
        console.log("Starting to Append Geoids...")

        var batch = true

        if(!batch){
                    
            var households = await Household.aggregate([{$match: {'blockgroupID': { $exists: false }}}]);
            for(var i = 0; i < households.length; i++){


                var blockgroup = await Blockgroup.findOne({'geometry': {
                    '$geoIntersects': {
                        '$geometry': households[i].location
                    }
                }});

                if(blockgroup){
                    console.log(blockgroup.properties.geoid)
                    var updated = await Household.updateOne(
                        { _id: households[i]._id },
                        { 'blockgroupID': blockgroup.properties.geoid },
                        //{ upsert: false, multi: true,}
                    );

                    console.log(updated)

                }
            
            }
        }

        
        if(batch){

   
        var blockgroups = await Blockgroup.find({'properties.county.name': "SAN BERNARDINO"});

        for(var i = 0; i < blockgroups.length; i++){
            console.log(blockgroups[i].properties.geoid)
            console.log(i)

            const agg2 = [
                {
                    '$match': {
                        'location.coordinates': { $elemMatch: { $exists: true } },
                        'blockgroupID': { $exists: false },
                        'location': {
                            '$geoIntersects': {
                                '$geometry': {
                                    'type': 'Polygon',
                                    'coordinates': blockgroups[i].geometry.coordinates[0]
                                }
                            }
                        }
                    }
                }, {
                    '$group': {
                        '_id': null,
                        'records': {
                            '$push': '$_id'
                        }
                    }
                }
            ];

            var saveBlockgroupID = await Household.aggregate(agg2);

            if(saveBlockgroupID.length) {
                var updated = await Household.updateMany(
                    { _id: {$in: saveBlockgroupID[0].records} },
                    { 'blockgroupID': blockgroups[i].properties.geoid },
                    { upsert: false, multi: true,}
                );
                console.log(updated)
            }
        }

        return {msg: "DONZO"}

    }

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {appendGeoids}