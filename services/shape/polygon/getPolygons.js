var Polygon = require('../../../models/shapes/polygon')
var Campaign = require('../../../models/campaigns/campaign')
var Organization = require('../../../models/organizations/organization')
var Districts = require('../../../models/campaigns/districts')
const turf = require("@turf/turf");
const intersect = require("@turf/intersect").default;

const isValidPolyFeature = (poly) => {
    return poly?.geometry?.type === 'Polygon' || poly?.geometry?.type === 'MultiPolygon';
};

const SKIP_GEO_FILTER_BOUNDARIES = ['CA_COUNTY_RIVERSIDE', 'CA_COUNTY_SANBERNARDINO'];

const shouldSkipGeoFilter = (boundaryIDs) => {
    if (!Array.isArray(boundaryIDs) || boundaryIDs.length !== SKIP_GEO_FILTER_BOUNDARIES.length) return false;
    const sorted = [...boundaryIDs].sort();
    const expected = [...SKIP_GEO_FILTER_BOUNDARIES].sort();
    return sorted.every((id, i) => id === expected[i]);
};

const findPolygonsInDistricts = async (baseFilter, boundaries, skipGeoFilter) => {
    if (skipGeoFilter) {
        // No geospatial filtering — fetch all matching polygons directly
        return Polygon.find(baseFilter).sort({ 'properties.name': 1 });
    }

    const boundaryResults = await Promise.all(
        boundaries.map(async (boundary) => {
            const filter = { ...baseFilter, geometry: { $geoIntersects: { $geometry: boundary.geometry } } };
            const polys = await Polygon.find(filter).sort({ 'properties.name': 1 });

            if (boundary.properties.districtType === "COUNTY") return polys;

            return polys.filter(polygon => {
                if (!isValidPolyFeature(polygon) || !isValidPolyFeature(boundary)) return false;
                const intersection = intersect(turf.featureCollection([polygon, boundary]));
                if (!intersection) return false;
                return turf.area(intersection) / turf.area(polygon) >= 0.3;
            });
        })
    );

    // A polygon crossing two boundaries matches both; keep it once
    const seen = new Set();
    return boundaryResults.flat().filter(polygon => {
        const id = String(polygon._id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

// The allocation list only needs names, not shapes
const withoutGeometry = (polygons) => polygons.map(p => ({ _id: p._id, type: p.type, properties: p.properties }));

const getPolygons = async (detail) => {
    const { campaignID, orgID, mode } = detail;

    const [campaign, myOrg] = await Promise.all([
        Campaign.findOne({ campaignID }),
        Organization.findById(orgID)
    ]);

    const skipGeoFilter = shouldSkipGeoFilter(campaign.boundaryIDs);
    if (skipGeoFilter) {
        console.log("Skipping geospatial filtering for Riverside/San Bernardino boundaries.");
    }

    const boundaries = skipGeoFilter
        ? []
        : await Districts.find({ 'properties.identifier': { $in: campaign.boundaryIDs } });

    const polygonFilter = { 'properties.orgID': orgID };
    if (mode === "campaign") polygonFilter['properties.campaignID'] = campaignID;

    const myOrgPolygons = await findPolygonsInDistricts(polygonFilter, boundaries, skipGeoFilter);
    myOrgPolygons.forEach(p => { p.properties.orgName = myOrg.name; });

    const features = [{ orgID, polys: myOrgPolygons, orgName: myOrg.name }];

    // Fetch other orgs' polygons + org docs in parallel
    const otherOrgIDs = campaign.orgIDs.filter(id => id != orgID);
    const otherFilter = mode === "campaign" ? { 'properties.campaignID': campaignID } : {};

    const otherFeatures = await Promise.all(
        otherOrgIDs.map(async (otherOrgID) => {
            const [otherPolygons, otherOrg] = await Promise.all([
                findPolygonsInDistricts({ ...otherFilter, 'properties.orgID': otherOrgID }, boundaries, skipGeoFilter),
                Organization.findById(otherOrgID)
            ]);
            otherPolygons.forEach(p => { p.properties.orgName = otherOrg.name; });
            return { orgID: otherOrgID, polys: otherPolygons, orgName: otherOrg.name };
        })
    );

    const allFeatures = [...features, ...otherFeatures];
    if (detail.withoutGeometry) {
        allFeatures.forEach(feature => { feature.polys = withoutGeometry(feature.polys); });
    }
    return allFeatures;
};

module.exports = {getPolygons}
