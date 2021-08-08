var Blockgroups = require('../../models/targets/blockgroup')
const getBlockgroupsByBounds= async(detail) => {
    try {
        p0 = [detail.bounds._southWest.lng, detail.bounds._southWest.lat]
        p1 = [detail.bounds._southWest.lng, detail.bounds._northEast.lat]
        p2 = [detail.bounds._northEast.lng, detail.bounds._northEast.lat]
        p3 = [detail.bounds._northEast.lng, detail.bounds._southWest.lat]
    
        p4 = [detail.bounds._southWest.lng, detail.bounds._southWest.lat]
        var arrayCoords = [p0, p1, p2, p3, p4]

        var geoid = '';
        if(detail.blockgroupIDS){
            geoid = { $in: detail.blockgroupIDS }
        }

        return await Blockgroups.find({ "properties.geoid": geoid ? geoid : { $exists: true },
                                         geometry: {$geoIntersects: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}
                                       });
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getBlockgroupsByBounds}
