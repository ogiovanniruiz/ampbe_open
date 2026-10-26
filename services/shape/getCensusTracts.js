var CensusTract = require('../../models/shapes/censusTract')
const getCensusTracts = async(data) => {
    try {
        return await CensusTract.find({"properties.county": data.county})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCensusTracts}