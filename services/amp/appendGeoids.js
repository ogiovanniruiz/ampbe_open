const Blockgroup = require('../../models/targets/blockgroup')
const HouseHold = require('../../models/houseHolds/houseHold')
const Precinct = require('../../models/targets/precinct')

const appendGeoids = async() => {
    try { 
        console.log("Starting to Append Geoids...")

        var batch = false

        var precinctMatch = true

        /*
        if(!batch){
                    
            var houseHolds = await HouseHold.aggregate([{$match: {'blockgroupID': { $exists: false }}}]);
            for(var i = 0; i < houseHolds.length; i++){


                var blockgroup = await Blockgroup.findOne({'geometry': {
                    '$geoIntersects': {
                        '$geometry': houseHolds[i].location
                    }
                }});

                if(blockgroup){
                    console.log(blockgroup.properties.geoid)
                    var updated = await HouseHold.updateOne(
                        { _id: houseHolds[i]._id },
                        { 'blockgroupID': blockgroup.properties.geoid },
                        //{ upsert: false, multi: true,}
                    );

                    console.log(updated)

                }
            
            }
        }*/

        
        if(batch){

   
        var blockgroups = await Blockgroup.find({'properties.county.name': "SOLANO"});

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

            var saveBlockgroupID = await HouseHold.aggregate(agg2);

            if(saveBlockgroupID.length) {
                var updated = await HouseHold.updateMany(
                    { _id: {$in: saveBlockgroupID[0].records} },
                    { 'blockgroupID': blockgroups[i].properties.geoid },
                    { upsert: false, multi: true,}
                );
                console.log(updated)
            }
        }

        return {msg: "DONZO"}

    }

    if(precinctMatch){

        var precincts = await Precinct.find({'properties.county.name': "SOLANO"});

        for(var i = 0; i < precincts.length; i++){

            console.log(precincts[i].properties.precinctID)
            console.log(i)

            const agg2 = [
                {
                    '$match': {
                        'location.coordinates': { $elemMatch: { $exists: true } },
                        'precinctID': { $exists: false },
                        'location': {
                            '$geoIntersects': {
                                '$geometry': precincts[i].geometry
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

            var saveprecinctID = await HouseHold.aggregate(agg2);

            if(saveprecinctID.length) {
                var updated = await HouseHold.updateMany(
                    { _id: {$in: saveprecinctID[0].records} },
                    { 'precinctID': precincts[i].properties.precinctID },
                    { upsert: false, multi: true,}
                );
                console.log(updated)
            }



        }

    }



    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {appendGeoids}