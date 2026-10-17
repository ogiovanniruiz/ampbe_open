var Blocks = require('../../../models/shapes/block')
const getBlocks = async(data) => {
    try {
        return await Blocks.find({"properties.county": data.county})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getBlocks}
