var Blockgroups = require('../../models/targets/blockgroup')
const getBlockgroup = async(detail) => {
    try {
        return await Blockgroups.findOne({"properties.geoid": detail.blockgroupID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getBlockgroup}
