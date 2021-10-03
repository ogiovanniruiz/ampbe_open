var Poly = require('../../models/targets/poly');
var Campaign = require('../../models/campaigns/campaign')

const createPolygon = async(polyDetails) => {
    try {

        var campaign = await Campaign.findOne({campaignID: polyDetails.properties.campaignID})


        var existingPoly = await Poly.findOne({'properties.name': polyDetails.properties.name, 
                                               'properties.campaignID': polyDetails.properties.campaignID})

        if(existingPoly) {
            return {msg: "Polygon with that name in this Campaign Already exists."}
        }

        if(campaign.geographical){
            var overLappingPoly = await Poly.findOne({ geometry: {$geoIntersects: { $geometry: polyDetails.geometry}},
                'properties.campaignID': polyDetails.properties.campaignID})

            if(overLappingPoly){
                return {msg: "Polygon within this region and campaign already exists."}
            }
        }

        var newCreatedPoly  = new Poly(polyDetails);
        newCreatedPoly.save();
        return {polygon: newCreatedPoly, mgs: "Success!"}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createPolygon}
