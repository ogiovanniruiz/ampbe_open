var Poly = require('../../../models/shapes/polygon');
var Campaign = require('../../../models/campaigns/campaign')

const createPolygon = async(polyDetails) => {
    try {

        var campaign = await Campaign.findOne({campaignID: polyDetails.properties.campaignID})


        var existingPoly = await Poly.findOne({'properties.name': polyDetails.properties.name, 
                                               'properties.orgID': polyDetails.properties.orgID,
                                            })

        if(existingPoly) {

            if(!existingPoly.properties.active){
                return {msg: "Polygon with that name in this Organization already exists. It is currently inactive. Please activate it before proceeding.", polygonExists: true}
            }

            return {msg: "Polygon with that name in this Organization already exists.", polygon: existingPoly, polygonExists: true}
        }

        if(campaign.geographical){
            var overLappingPoly = await Poly.findOne({ geometry: {$geoIntersects: { $geometry: polyDetails.geometry}},
                                                      'properties.orgID': polyDetails.properties.orgID,
                                                    })

            if(overLappingPoly){
                return {msg: "This campaign does not allow overlapping Polygons. A Polygon within this region and organization already exists.", polygon: overLappingPoly, polygonExists: true}
            }
        }

        var newCreatedPoly  = new Poly(polyDetails);
        await newCreatedPoly.save();
        return {polygon: newCreatedPoly, msg: "Success!", polygonExists: false}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createPolygon}
