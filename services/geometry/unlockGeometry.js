var Blockgroup = require('../../models/targets/blockgroup');
var Precinct = require('../../models/targets/precinct');


const unlockGeometry = async(geometryDetails) => {
    try {

        if (geometryDetails.type === 'BLOCKGROUP') {
            var geometry = await Blockgroup.findOne({_id: geometryDetails.geometryID});
            var type = 'Blockgroups';
        } else if (geometryDetails.type === 'PRECINCT') {
            var geometry = await Precinct.findOne({_id: geometryDetails.geometryID});
            var type = 'Precincts';
        }

        for (var i = geometry.properties.locked.length - 1; i >= 0; i--) {
            if (geometry.properties.locked[i].campaignID === geometryDetails.campaignID && geometry.properties.locked[i].orgID === geometryDetails.orgID) {
                geometry.properties.locked.splice(i, 1);
                await geometry.save();
            }
        }

        return {success: true, geometry: geometry, type: type, msg: "Success.", mode: "unlocked"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {unlockGeometry}
