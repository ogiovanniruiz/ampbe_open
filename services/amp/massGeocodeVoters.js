const HouseHold = require('../../models/houseHolds/houseHold')
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
    
            const agg = [
                {
                    '$match': {
                        'location': {
                            '$exists': false
                        }
                    }
                }, {
                    '$limit': batch_size
                }
            ];
    
            var address = await HouseHold.aggregate(agg);
            var addressObject = {addresses: [], id: {}}
            //console.log(address, "HERE")
    
            for(var i = 0; i < address.length; i++){
    
                var astring = ""
                //console.log(address[i])
    
                if(address[i]._id.streetNum) {astring = astring + address[i]._id.streetNum + " "}
                if(address[i]._id.prefix) {astring = astring + address[i]._id.prefix + " "}
                if(address[i]._id.street) {astring = astring + address[i]._id.street + " "}
                if(address[i]._id.suffix) {astring = astring + address[i]._id.suffix + " "}
                if(address[i]._id.unit) {astring = astring + address[i]._id.unit + " "}
                if(address[i]._id.city) {astring = astring + address[i]._id.city + ", CA "}
                if(address[i]._id.zip) {astring = astring + address[i]._id.zip}
    
                addressObject.addresses.push(astring)
                addressObject.id[astring] = address[i]._id
    
            }
            if(address) {
                //console.log(addressObject.addresses)
                await geocodio.geocode(addressObject.addresses).then(async response => {
    
                    var bulkArray = [];
                    for(var key in addressObject.id){
    
                        var index = response.results.findIndex(x => x.query === key)
    
                        if(!response.results[index].response.results[0]){
    
                            response.results[index].response.results.push({accuracy_type: "none",
                                                                           location:{lat: 0, lng: 0}})
    
                        }
    
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
    
                    var updated = await HouseHold.bulkWrite(bulkArray);
                    console.log(updated)



    
                }).catch(err => {
                    console.error(err);
                });

                index = index + batch_size
                console.log("Geocoded: ", index)
    
    

               
    
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