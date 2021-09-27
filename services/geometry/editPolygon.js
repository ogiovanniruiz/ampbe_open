var Poly = require('../../models/targets/poly');

const editPolygon = async(polyDetails) => {
    try {

        var polygon = await Poly.findById(polyDetails._id)
        polygon.properties.name = polyDetails.properties.name
        polygon.properties.description = polyDetails.properties.description
        return polygon.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editPolygon}