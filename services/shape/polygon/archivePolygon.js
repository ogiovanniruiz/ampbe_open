var Polygon = require('../../../models/shapes/polygon.js')
var Organization = require('../../../models/organizations/organization')

// setActive makes the call idempotent; without it the polygon toggles (older callers)
const archivePolygon = async(detail) => {
    try { 

        var polygon  = await Polygon.findOne({_id: detail.polygonID})
        if(!polygon) return null

        var myOrg = await Organization.findById(polygon.properties.orgID)
        if(myOrg) polygon.properties.orgName = myOrg.name

        polygon.properties.active = typeof detail.setActive === 'boolean' ? detail.setActive : !polygon.properties.active
        return polygon.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archivePolygon}
