const Precinct = require('../../models/shapes/registrationPrecinct')
const Household = require('../../models/households/household')

const appendPrecinctIDs = async() => {
    try {  

        var precincts = await Precinct.find({'properties.county.name': "SAN BERNARDINO"});
    
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
    
                var saveprecinctID = await Household.aggregate(agg2);
    
                if(saveprecinctID.length) {
                    var updated = await Household.updateMany(
                        { _id: {$in: saveprecinctID[0].records} },
                        { 'precinctID': precincts[i].properties.precinctID },
                        { upsert: false, multi: true,}
                    );
                    console.log(updated)
                }
    
    
    
        }
    
        


       } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {appendPrecinctIDs}