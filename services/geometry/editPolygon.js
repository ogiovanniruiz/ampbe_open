var Poly = require('../../models/targets/poly');

const editPolygon = async(polyDetails) => {
    try {

        //console.log(polyDetails)
        var polygon = await Poly.findById(polyDetails._id)
        
        var existingPoly = await Poly.findOne({'properties.name': polyDetails.properties.name, 
                                               'properties.campaignID': polyDetails.properties.campaignID})

        if(existingPoly) console.log(existingPoly.properties.name)
        
        console.log(polyDetails.properties.name)

        if(existingPoly && (existingPoly.properties.name != polygon.properties.name)) {
            console.log("FOUND")
            return {msg: "Polygon with that name in this Campaign Already exists."}
        }

        
        polygon.properties.name = polyDetails.properties.name
        polygon.properties.description = polyDetails.properties.description

        polygon.save()
        return {polygon: polygon}
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editPolygon}