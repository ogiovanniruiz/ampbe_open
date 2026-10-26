
const Geocodio = require('geocodio-library-node');
var Membership = require('../../../models/people/membership')
var {uploadQuery} = require('../memberFields')
var Uploads = require('../../../models/organizations/upload')
var AssignMemberDistricts = require('./assignMemberDistricts')

const geocodeMemberUpload = async(uploadID) => {
    try { 
        console.log("Starting to Geocode...");
        var geocodioAPIKey = process.env.geocodioAPIKey;
        const geocodio = new Geocodio(geocodioAPIKey);
        
        var index = 0;
        var geocoding = true

        while (geocoding) {
    
            var members = await Membership.find({geocoded: {$ne: true}, ...uploadQuery(uploadID), fullAddress1: {$exists: true}}).limit(100);
            
            if(members.length === 0){
                var upload = await Uploads.findById(uploadID)
                upload.geocoded = true
                await upload.save()
                console.log("Exiting Geocode Loop...")
                geocoding = false;
                AssignMemberDistricts.assignMemberDistricts(uploadID)
            }
            
            var memberObject = {addresses: [], id: {}}
        
            for(var i = 0; i < members.length; i++){
                if(members[i].fullAddress1 != ''){
                    var astring = members[i].fullAddress1 + " " + members[i].address.city + " CA, " + members[i].address.zip;
    
                    memberObject.addresses.push(astring);
                    memberObject.id[astring] = members[i]._id
                }
            }

            if(memberObject.addresses.length > 0) {

                await geocodio.geocode(memberObject.addresses).then(async response => {
                    var bulkArray = [];
                    for(var key in memberObject.id){
    
                        var index = response.results.findIndex(x => x.query === key)

                        var prefix = ''
                        var suffix = ''
                        var street = ''
                        var streetNum = ''
                        var lat = 0
                        var lng = 0
                        var accuracyType = ""

                        if(response.results[index].response.results[0]){
                            if(response.results[index].response.results[0].address_components.predirectional){
                                prefix = response.results[index].response.results[0].address_components.predirectional.toUpperCase()
                            }
    
                            if(response.results[index].response.results[0].address_components.suffix){
                                suffix = response.results[index].response.results[0].address_components.suffix.toUpperCase()
                            }
    
                            if(response.results[index].response.results[0].address_components.formatted_street){
                                street = response.results[index].response.results[0].address_components.formatted_street.toUpperCase().split(" ").slice(0, -1).join(" ");
                            }else{
                                console.log("WARN!!!")
                                console.log(response)
                            }
    
                            if(response.results[index].response.results[0].address_components.number){
                                streetNum = response.results[index].response.results[0].address_components.number.toUpperCase()
                            }

                            lng = response.results[index].response.results[0].location.lng
                            lat = response.results[index].response.results[0].location.lat
                            accuracyType = response.results[index].response.results[0].accuracy_type
            
                        }

                        bulkArray.push({ updateOne : {
                            "filter" : { "_id" : memberObject.id[key]},
                            "update" : { $set : {
                                    'accuracyType': accuracyType,
                                    'location.type': 'Point',
                                    geocoded: true,
                                    'location.coordinates': [lng,lat],
                                    'address.streetNum': streetNum,
                                    'address.street': street,
                                    'address.suffix': suffix,
                                    'address.prefix': prefix,
                            } }
                    }})

                    }

                    var updated = await Membership.bulkWrite(bulkArray);
                    console.log(updated)

                }).catch(err => {
                    geocoding = false;
                    console.error(err);
                    return
                    
                });

                index = index + members.length
                console.log("Geocoded: ", index)
            }        
        }

        console.log("Finished Mass Geocoding Membership List.")

    }
    catch(e){
            throw new Error(e.message)
    }
}
    
module.exports = {geocodeMemberUpload}