const Household = require('../../models/households/household')

const getZips = async(boundary) => {
    try {
        var filter = {};
        var filterSet = [];

        var parameter = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
        for(var i = 0; i < boundary.length; i++){
                filterSet.push(boundary[i].properties.identifier);
        }
        filter[parameter] = { $in: filterSet}

        return await Household.distinct('_id.zip', filter)
 
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getZips}
