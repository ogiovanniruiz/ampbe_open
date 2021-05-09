var Blockgroup = require('../../models/targets/blockgroup');
var Precinct = require('../../models/targets/precinct');

const unregisterGeometry = async(geometryDetails) => {
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
                geometry.properties.registered.splice(i, 1);
            }
        }

        geometry.save()
        return {success: true, geometry: geometry, type: type, msg: "Success.", mode: "unregister"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {unregisterGeometry}
