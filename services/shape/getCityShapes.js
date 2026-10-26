const Districts = require('../../models/campaigns/districts')

const getCityShapes = async(boundary) => {
    try {
        var filter = {};
        var filterSet = [];

        var parameter = "districts." + boundary[0].properties.districtType.toLowerCase() + "ID"
        for(var i = 0; i < boundary.length; i++){
            filterSet.push(boundary[i].geometry);
        }
        filter[parameter] = { $in: filterSet}

        return await Districts.find({'properties.districtType': "CITYWIDE", geometry: {"$geoIntersects": {$in: filterSet}}})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCityShapes}