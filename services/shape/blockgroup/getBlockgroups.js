var Blockgroups = require('../../../models/shapes/blockgroup')
const getBlockgroups = async(data) => {
    try {
        return await Blockgroups.find({"properties.county.name": data.county})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getBlockgroups}
