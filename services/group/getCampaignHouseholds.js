var Households = require('../../models/households/household')
const getCampaignHouseholds = async( bounds)=> {
    try {
        p0 = [bounds._southWest.lng, bounds._southWest.lat]
        p1 = [bounds._southWest.lng, bounds._northEast.lat]
        p2 = [bounds._northEast.lng, bounds._northEast.lat]
        p3 = [bounds._northEast.lng, bounds._southWest.lat]
    
        p4 = [bounds._southWest.lng, bounds._southWest.lat]
        var arrayCoords = [p0, p1, p2, p3, p4]

        return await Households.find({ location: {$geoIntersects: { $geometry: {type: "Polygon" , coordinates: [arrayCoords] }}}}, {location: 1});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignHouseholds}
