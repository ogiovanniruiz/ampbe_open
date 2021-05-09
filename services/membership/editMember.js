var Membership = require('../../models/organizations/membership')
var Geocode = require('../amp/geocode')
var IdentifyDistricts = require('../amp/identifyDistricts')
var Blockgroups = require('../../models/targets/blockgroup')
var Precincts = require('../../models/targets/precinct')
var FindVoter = require('../amp/findVoter');

const editMember = async(detail) => {
    try { 
        var member = await Membership.findById(detail.oldMember._id)

        member.resident.name = detail.newMember.name;
        member.resident.phones = detail.newMember.phones;
        member.resident.email = detail.newMember.email;
        member.resident.state = detail.newMember.state;
        member.resident.dob = detail.newMember.dob;
        member.resident.tags = detail.newMember.tags;
        member.resident.ethnicity = detail.newMember.ethnicity;

        if(detail.newMember.address && (member.address.address != detail.newMember.address || member.address.city != detail.newMember.city || member.address.zip != detail.newMember.zip)){
            member.address.city = detail.newMember.city;
            member.address.zip = detail.newMember.zip;
            member.address.address = detail.newMember.address;
            member.fullAddress1 = detail.newMember.address.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            member.fullAddress2 = (detail.newMember.city + ' ' + detail.newMember.state.abbrv + ' ' + detail.newMember.zip).replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');

            var fullAddress = detail.newMember.address + ' ' + detail.newMember.city + ' ' + detail.newMember.zip;
            var geocodeResults = await Geocode.geocode(fullAddress);
            member.location.coordinates = geocodeResults;
            var identifiedDistricts = await IdentifyDistricts.identifyDistricts(member.location.coordinates);

            member.districts = {}

            for(var i = 0;  i < identifiedDistricts.length; i++){
                var districtTypeParam = identifiedDistricts[i].properties.districtType.toLowerCase() + "ID";
                member.districts[districtTypeParam] = await identifiedDistricts[i].properties.identifier;
            }

            var blockgroup = await Blockgroups.findOne({geometry: {$geoIntersects: {$geometry: member.location}}});
            var precinct = await Precincts.findOne({geometry: {$geoIntersects: {$geometry: member.location}}});

            member.blockgroupID = blockgroup.properties.geoid;
            member.precinctID = precinct.properties.precinctID;
        }

        if(!detail.newMember.address || !detail.newMember.city || !detail.newMember.zip){
            member.address.city = detail.newMember.city;
            member.address.zip = detail.newMember.zip;
            member.address.address = detail.newMember.address ? detail.newMember.address : member.resident.personID;
            member.fullAddress1 = '';
            member.fullAddress2 = (detail.newMember.city + ' ' + detail.newMember.state.abbrv + ' ' + detail.newMember.zip).replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gmi, '');
            member.blockgroupID = '';
            member.precinctID = '';
        }

        await member.save();

        FindVoter.findVoterStatus(member._id, 'manual');

        return {status: true, member: member}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editMember}
