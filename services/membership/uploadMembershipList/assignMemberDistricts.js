var Membership = require('../../../models/people/membership')
var {uploadQuery} = require('../memberFields')
var identifyDistricts = require('../../amp/identifyDistricts')

//var Blockgroups = require('../../../models/shapes/blockgroup')
//var Precincts = require('../../../models/shapes/precinct')
var Uploads = require('../../../models/organizations/upload')


const assignMemberDistricts = async(uploadID) => {
    try { 


        var members = await Membership.find({...uploadQuery(uploadID), 'location': {$exists: true}, districts: {$exists: false}})

        console.log("Assigning Districts.")
        for(var i = 0; i < members.length; i++){


            var identifiedDistricts = await identifyDistricts.identifyDistricts(members[i].location)

            members[i].districts = {}

            for(var j = 0;  j < identifiedDistricts.length; j++){
                var districtTypeParam = identifiedDistricts[j].properties.districtType.toLowerCase() + "ID";
                members[i].districts[districtTypeParam] =  identifiedDistricts[j].properties.identifier
            }


            console.log("Districts Assigned: ", i)
            await members[i].save()
        }

        console.log("District Assignment Complete.")

        var upload = await Uploads.findById(uploadID)

        upload.geographyFound = true
        await upload.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {assignMemberDistricts}