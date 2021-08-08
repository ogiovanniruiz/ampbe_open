var Blockgroup = require('../../models/targets/blockgroup');
var Precinct = require('../../models/targets/precinct');

const lockGeometry = async(geometryDetails) => {
    try {

        if (geometryDetails.type === 'BLOCKGROUP') {
            var geometry = await Blockgroup.findOne({_id: geometryDetails.geometryID});
            var type = 'Blockgroups';
        } else if (geometryDetails.type === 'PRECINCT') {
            var geometry = await Precinct.findOne({_id: geometryDetails.geometryID});
            var type = 'Precincts';
        }

        for (var i = 0; i < geometry.properties.locked.length; i++) {
            if (geometry.properties.locked[i].campaignID === geometryDetails.campaignID) {
                return {success: false, msg: "Geometry already locked."}
            }
        }

        for (var j = geometry.properties.registered.length - 1; j >= 0; j--) {
            if (geometry.properties.registered[j].campaignID === geometryDetails.campaignID) {
                geometry.properties.registered.splice(j, 1);
            }
        }

        geometry.properties['locked'].push({orgID: geometryDetails.orgID, campaignID: geometryDetails.campaignID, geometryID: geometryDetails.geometryCollID});
        await geometry.save();

        return {success: true, geometry: geometry, type: type, msg: "Success.", mode: "locked"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {lockGeometry}
