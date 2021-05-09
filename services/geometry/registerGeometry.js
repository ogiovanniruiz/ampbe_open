var Blockgroup = require('../../models/targets/blockgroup');
var Precinct = require('../../models/targets/precinct');

const registerGeometry = async(geometryDetails) => {
    try {

        if (geometryDetails.type === 'BLOCKGROUP') {
            var geometry = await Blockgroup.findOne({_id: geometryDetails.geometryID});
            var type = 'Blockgroups';
        } else if (geometryDetails.type === 'PRECINCT') {
            var geometry = await Precinct.findOne({_id: geometryDetails.geometryID});
            var type = 'Precincts';
        }

        for (var i = 0; i < geometry.properties.registered.length; i++) {
            if (geometry.properties.registered[i].orgID === geometryDetails.orgID && geometry.properties.registered[i].campaignID === geometryDetails.campaignID) {
                return {success: false, msg: "Geometry already registered."}
            }
        }

        geometry.properties['registered'].push({orgID: geometryDetails.orgID, campaignID: geometryDetails.campaignID});
        await geometry.save()

        return {success: true, geometry: geometry, type: type, msg: "Success.", mode: "registered"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {registerGeometry}
