var Polygon = require('../../../models/shapes/polygon');

const editPolygon = async(polyDetails) => {
    try {

        var polygon = await Polygon.findById(polyDetails._id)
        
        var existingPoly = await Polygon.findOne({'properties.name': polyDetails.properties.name, 
                                                  'properties.campaignID': polyDetails.properties.campaignID})


        if(existingPoly && (existingPoly.properties.name != polygon.properties.name)) {
            return {msg: "Polygon with that name in this Campaign Already exists."}
        }

        polygon.properties.name = polyDetails.properties.name
        polygon.properties.description = polyDetails.properties.description

        await polygon.save()
        return {polygon: polygon}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editPolygon}