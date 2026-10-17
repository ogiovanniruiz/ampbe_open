var IdentifyDistricts = require('../../amp/identifyDistricts');
var Membership = require('../../../models/people/membership');

var Geocode = require('../../amp/geocode')

const geocodeOneMember = async(member) => {

    var fullAddress = member.fullAddress1 + ' ' + member.fullAddress2;
    var geocodeResults = await Geocode.geocode(fullAddress);

    if(geocodeResults.parsedAddress.predirectional){
        member.address.prefix = geocodeResults.parsedAddress.predirectional.toUpperCase()
    }

    if(geocodeResults.parsedAddress.suffix){
        member.address.suffix = geocodeResults.parsedAddress.suffix.toUpperCase()
    }
    
    member.address.street = geocodeResults.parsedAddress.formatted_street.toUpperCase()
    member.address.city = geocodeResults.parsedAddress.city.toUpperCase();

    member.address.zip = geocodeResults.parsedAddress.zip
    member.location.coordinates = geocodeResults.coordinates
    member.address.streetNum = geocodeResults.parsedAddress.number

    var identifiedDistricts = await IdentifyDistricts.identifyDistricts(member.location.coordinates);
    
    member.districts = {};

    for(var i = 0;  i < identifiedDistricts.length; i++){
        var districtTypeParam = identifiedDistricts[i].properties.districtType.toLowerCase() + "ID";
        member.districts[districtTypeParam] =  identifiedDistricts[i].properties.identifier;
    }

    //var precinct = await Precincts.findOne({geometry: {$geoIntersects: {$geometry: member.location}}});

    //member.precinctID = precinct.properties.precinctID;

    console.log("Finished Geocoding and Assigned Districts.")

    await member.save();

}

module.exports = {geocodeOneMember}