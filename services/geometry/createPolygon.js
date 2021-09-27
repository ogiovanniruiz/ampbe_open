var Poly = require('../../models/targets/poly');

const createPolygon = async(polyDetails) => {
    try {
        var newCreatedPoly  = new Poly(polyDetails);
        return newCreatedPoly.save();

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createPolygon}
