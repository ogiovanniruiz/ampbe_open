var Membership = require('../../models/organizations/membership')
var identifyDistricts = require('./identifyDistricts')

var Blockgroups = require('../../models/targets/blockgroup')
var Precincts = require('../../models/targets/precinct')

var Uploads = require('../../models/organizations/upload')
var People = require('../../models/people/people');

const massIdentifyDistricts = async(uploadID) => {
    try { 

        var members = await Membership.find({'resident.uploadID': uploadID})

        for(var i = 0; i < members.length; i++){

            var identifiedDistricts = await identifyDistricts.identifyDistricts(members[i].location)

            members[i].districts = {}

            for(var j = 0;  j < identifiedDistricts.length; j++){
                var districtTypeParam = identifiedDistricts[j].properties.districtType.toLowerCase() + "ID";
                members[i].districts[districtTypeParam] =  identifiedDistricts[j].properties.identifier
            }

            var blockgroup = await Blockgroups.findOne({geometry: {$geoIntersects: {$geometry: members[i].location}}})
            var precinct = await Precincts.findOne({geometry: {$geoIntersects: {$geometry: members[i].location}}})

            members[i].blockgroupID = blockgroup.properties.geoid
            members[i].precinctID = precinct.properties.precinctID

            if(members[i].resident.phones.length === 0 && !members[i].resident.email){
                var voter = await People.findOne({'location.coordiniates.0': members[i].location.coordinates[0], 'location.coordinates.1': members[i].location.coordinates[1]})
                if(voter){
                    members[i].voter = true
                    members[i].resident.affidavit = voter.resident.affidavit
                }
            }
            members[i].save()
        }

        var upload = await Uploads.findById(uploadID)

        upload.geographyFound = true
        upload.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {massIdentifyDistricts}