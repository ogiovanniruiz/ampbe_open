var Membership = require('../../models/organizations/membership');
var Geocode = require('../amp/geocode');
var IdentifyDistricts = require('../amp/identifyDistricts');
var Blockgroups = require('../../models/targets/blockgroup');
var Precincts = require('../../models/targets/precinct');
var mongoose = require('mongoose');
var FindVoter = require('../amp/findVoter');

const createMember = async(member) => {
    try { 
        var query = {'resident.orgID': member.resident.orgID, 'resident.name.firstName': member.resident.name.firstName};
        var personID = mongoose.Types.ObjectId();

        if(member.fullAddress1 != ''){
            query['address.address'] = member.address.address;
            query['address.city'] = member.address.city;
            query['address.zip'] = member.address.zip;

            var fullAddress = member.fullAddress1 + ' ' + member.fullAddress2;
            var geocodeResults = await Geocode.geocode(fullAddress);

            member.location.coordinates = geocodeResults;
            var identifiedDistricts = await IdentifyDistricts.identifyDistricts(member.location.coordinates);
            
            member.districts = {};

            for(var i = 0;  i < identifiedDistricts.length; i++){
                var districtTypeParam = identifiedDistricts[i].properties.districtType.toLowerCase() + "ID";
                member.districts[districtTypeParam] =  identifiedDistricts[i].properties.identifier;
            }
            var blockgroup = await Blockgroups.findOne({geometry: {$geoIntersects: {$geometry: member.location}}});

            var precinct = await Precincts.findOne({geometry: {$geoIntersects: {$geometry: member.location}}});

            member.blockgroupID = blockgroup.properties.geoid;
            member.precinctID = precinct.properties.precinctID;
        } else {
            member.address.address = personID;
        }

        if(member.resident.phones.number) query['resident.phones.number'] = member.resident.phones.number;
        if(member.resident.email !== '') query['resident.email'] = member.resident.email;

        var foundMember = await Membership.findOne(query);
        if(foundMember){
            return {status: false, member: foundMember}
        }

        if(!member.address.state.abbrv) member.address.state = {abbrv: 'CA', name: 'CALIFORNIA'};
        if(!member.resident.tags) member.resident.tags = [];
        member.resident.personID = personID;

        var newMember = new Membership(member);
        await newMember.save();

        FindVoter.findVoterStatus(newMember._id, 'manual');

        return {status: true, member: newMember}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createMember}
