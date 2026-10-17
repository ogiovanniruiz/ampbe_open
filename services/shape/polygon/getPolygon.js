var Polygon = require('../../../models/shapes/polygon')

const getPolygon = async(detail) => {
    try {
        return Polygon.findById(detail.polygonID)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPolygon}