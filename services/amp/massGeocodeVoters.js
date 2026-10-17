const Household = require('../../models/households/household')
const Geocodio = require('geocodio-library-node');
var async = require('async');

const massGeocodeVoters= async() => {
    try { 
        console.log("Starting to Geocode...")
        var geocodioAPIKey = process.env.geocodioAPIKey
        const geocodio = new Geocodio(geocodioAPIKey);
        
        var index = 0

        var batch_size = 100

        async.forever(
            async function(next) {
                console.log("/////////Loop Starts///////////")
                index = index + 1
                console.log("Batch #: ", index)
    
            const agg = [
                {
                    '$match': {
                        accuracyType: {$exists: false},
                        //'_id.city': {$nin: ["LONG BEACH", "LOS ANGELES"]},
                        //'residents.2':{$exists: true}
                    }
                }, {
                    '$limit': batch_size
                }
            ];
    
            var households = await Household.aggregate(agg);
            var addressObject = {addresses: [], id: {}}

    
            for(var i = 0; i < households.length; i++){
                var astring = ""
                if(households[i]._id.streetNum) {astring = astring + households[i]._id.streetNum + " "}
                if(households[i]._id.prefix) {astring = astring + households[i]._id.prefix + " "}
                if(households[i]._id.street) {astring = astring + households[i]._id.street + " "}
                if(households[i]._id.suffix) {astring = astring + households[i]._id.suffix + " "}
                if(households[i]._id.unit) {astring = astring + households[i]._id.unit + " "}
                if(households[i]._id.city) {astring = astring + households[i]._id.city + ", CA "}
                if(households[i]._id.zip) {astring = astring + households[i]._id.zip}
    
                addressObject.addresses.push(astring)
                addressObject.id[astring] = households[i]._id
            }

            console.log("Houses Found: ", households.length)
            if(households.length > 0) {
                console.log("Sending Data to Geocodio.")
                await geocodio.geocode(addressObject.addresses).then(async response => {
                    console.log("Results Returned from Geocodio.")
                    var bulkArray = [];
                    for(var key in addressObject.id){
    
                        var index = response.results.findIndex(x => x.query === key)
        
                        bulkArray.push({ updateOne : {
                                "filter" : { "_id" : addressObject.id[key]},
                                "update" : { $set : {
                                        'accuracyType': response.results[index].response.results[0].accuracy_type,
                                        'location.type': 'Point',
                                        'location.coordinates': [
                                            response.results[index].response.results[0].location.lng,
                                            response.results[index].response.results[0].location.lat
                                            
                                        ],
                                } }
                        }})
                    }
    
                    var updated = await Household.bulkWrite(bulkArray);
                    console.log("Matched: ", updated.result.nMatched, "Modded: ", updated.result.nModified )

                }).catch(err => {
                    console.error(err);
                });

            }else{
                console.log("DONE")
                return callback('stop')
            } 
              
        })

        return {msg: "Processing..."}



    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {massGeocodeVoters}