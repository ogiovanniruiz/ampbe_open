var Poly = require('../../models/targets/poly');
var HouseHold = require('../../models/houseHolds/houseHold')

const editPolygon = async(polyDetails) => {
    try {

        var polygon = await Poly.findById(polyDetails._id)
        
        var existingPoly = await Poly.findOne({'properties.name': polyDetails.properties.name, 
                                               'properties.campaignID': polyDetails.properties.campaignID})


        if(existingPoly && (existingPoly.properties.name != polygon.properties.name)) {
            return {msg: "Polygon with that name in this Campaign Already exists."}
        }

        
        polygon.properties.name = polyDetails.properties.name
        polygon.properties.description = polyDetails.properties.description

        //var num_hh = await HouseHold.countDocuments({location: {$geoIntersects: { $geometry: polygon.geometry}}})

        
        //polygon.properties.demographics.total_hh = num_hh

        polygon.save()
        return {polygon: polygon}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editPolygon}