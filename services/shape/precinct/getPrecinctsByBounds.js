var RegisterationPrecincts = require('../../../models/shapes/registrationPrecinct')
var Districts = require('../../../models/campaigns/districts')
var Campaign = require('../../../models/campaigns/campaign')
var People = require('../../../models/people/people');
const turf = require("@turf/turf");
const intersect = require("@turf/intersect").default;

const getPrecinctsByBounds = async(detail) => {
    try {

        var campaign = await Campaign.findOne({campaignID: detail.campaignID})
        var boundaries = await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs}})
        
        var filter = {}

        var validPrecincts = []
        
        for(var i = 0; i < boundaries.length; i++){ 
            filter['geometry'] =  { $geoIntersects: {$geometry: boundaries[i].geometry} }

            var foundPrecincts = await RegisterationPrecincts.find(filter)

            // Precincts entirely inside the boundary pass without the slow overlap math
            var inside = new Set((await RegisterationPrecincts.find(
                {geometry: { $geoWithin: {$geometry: boundaries[i].geometry} }}, {_id: 1}).lean()).map(x => String(x._id)))

            const b = turf.feature(boundaries[i].geometry);
            const boundaryValid = isValidPolyFeature(boundaries[i]);

            const results = foundPrecincts.filter(precinct => {
                if (!boundaryValid || !isValidPolyFeature(precinct)) return false;
                if (inside.has(String(precinct._id))) return true;

                const p = turf.feature(precinct.geometry);
                const ratio = overlapRatio(p, b);
                return ratio >= 0.3;
            });

            validPrecincts = validPrecincts.concat(results)
        }

        return validPrecincts

    } catch(e){
        throw new Error(e.message)
    }
}


// Share of the precinct's area inside the boundary. District shapes can be huge, so the boundary is
// first cut down to the precinct's bounding box; the precinct lies inside that box, so the result is the same
function overlapRatio(precinct, boundary) {
    let intersection;
    try {
        const clipped = turf.bboxClip(boundary, turf.bbox(precinct));
        intersection = intersect(turf.featureCollection([precinct, clipped]));
    } catch(e) {
        intersection = intersect(turf.featureCollection([precinct, boundary]));
    }
    if (!intersection) return 0;
    return turf.area(intersection) / turf.area(precinct);
}

function isValidPolyFeature(feat) {
  const g = feat?.geometry;
  if (!g || !["Polygon", "MultiPolygon"].includes(g.type)) return false;

  const rings = g.type === "Polygon" ? g.coordinates : g.coordinates.flat();
  // rings = array of linear rings
  for (const ring of rings) {
    if (!Array.isArray(ring) || ring.length < 4) return false;
    const first = ring[0], last = ring[ring.length - 1];
    if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) return false;
  }
  return true;
}
module.exports = {getPrecinctsByBounds}
