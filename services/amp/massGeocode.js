
var async = require('async');
const Geocodio = require('geocodio-library-node');
var Membership = require('../../models/organizations/membership')
var Uploads = require('../../models/organizations/upload')
var massIdentifyDistricts = require('./massIndentifyDistricts')

const massGeocodeMembership = async(uploadID) => {
    try { 
        
        console.log("Starting to Geocode...");
        var geocodioAPIKey = process.env.geocodioAPIKey;
        const geocodio = new Geocodio(geocodioAPIKey);
        
        var index = 0;

        async.forever(
            async function(next) {
        
            var members = await Membership.find({geocoded: false, 'resident.uploadID': uploadID, fullAddress1: {$exists: true}}).limit(100);
            var memberObject = {addresses: [], id: {}}
    
            for(var i = 0; i < members.length; i++){

                if(members[i].fullAddress1 != ''){
                    var astring = members[i].address.address + " " + members[i].address.city + " " + members[i].address.zip;
    
                    memberObject.addresses.push(astring);
                    memberObject.id[astring] = members[i]._id
                }else{
                    members[i].geocoded = true;
                    members[i].save()
                }
            }

            if(members.length > 0) {
                await geocodio.geocode(memberObject.addresses).then(async response => {
    
                    var bulkArray = [];
                    for(var key in memberObject.id){
    
                        var index = response.results.findIndex(x => x.query === key)
    
                        if(!response.results[index].response.results[0]){
    
                            response.results[index].response.results.push({accuracy_type: "none",
                                                                           location:{lat: 0, lng: 0}})
    
                        }
    
                        bulkArray.push({ updateOne : {
                                "filter" : { "_id" : memberObject.id[key]},
                                "update" : { $set : {
                                        'accuracyType': response.results[index].response.results[0].accuracy_type,
                                        'location.type': 'Point',
                                        'geocoded': true,
                                        'location.coordinates': [
                                            response.results[index].response.results[0].location.lng,
                                            response.results[index].response.results[0].location.lat
                                            
                                        ],
                                } }
                        }})
                    }
    
                    var updated = await Membership.bulkWrite(bulkArray);
                    console.log(updated)
    
                }).catch(err => {
                    console.error(err);
                    return
                    
                });
    
    
                index = index + 100
                console.log("Geocoded: ", index)
    
            }else{
                var upload = await Uploads.findById(uploadID)
                upload.geocoded = true
                upload.save()
                console.log("DONE")
                massIdentifyDistricts.massIdentifyDistricts(uploadID)

                return next(stop)
            }  
        }, function(error){
            console.log(error)
        })

        return {msg: "Processing..."}

    } catch(e){
        throw new Error(e.message)
    }
}




module.exports = {massGeocodeMembership}
