var Poly = require('../../models/targets/poly');

const createPolygon = async(polyDetails) => {
    try {
        var newCreatedPoly  = new Poly(polyDetails);
        newCreatedPoly.save();

        return {success: true, polygon: newCreatedPoly, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createPolygon}
