const Campaign    = require('../../models/campaigns/campaign');
const Household   = require('../../models/households/household');
const People      = require('../../models/people/people');
const Membership  = require('../../models/people/membership');
const { buildBaseFilter, validPhoneMatch, GROUP_BY_ADDRESS_STAGE, EMPTY_ESTIMATE, makeSpecialFilter } = require('./groupUtils');
const { getInvalidPhonePersonIDs, getNonTextablePhones } = require('./contactExclusions');
const { MAX_ACTIVITY_HOUSEHOLDS } = require('./generateGroupResults');

// Cap on locations returned for the mini-map. Each one becomes a Leaflet marker,
// and pushing every location into one document exceeded MongoDB's 16MB limit.
const MAX_MAP_LOCATIONS = 5000;

// ─── Pipeline parts ───────────────────────────────────────────────────────────
// Each mode is described by three parts:
//   prefix       - stages that select the group's docs
//   toHouseholds - stages that give one doc per address with residents/numResidents and location
//   toResidents  - stages that give one doc per resident, shaped { r: <resident> }
// The prefix runs once; the counts, phones, textable and location facets branch off it.

// Address-level grouping of one-person docs (People), counting residents and keeping a location
const INDIVIDUAL_BY_ADDRESS_STAGE = {
    $group: {
        _id: {
            streetNum: '$address.streetNum',
            prefix:    '$address.prefix',
            street:    '$address.street',
            suffix:    '$address.suffix',
            unit:      '$address.unit',
            city:      '$address.city',
            state:     '$address.state',
            zip:       '$address.zip',
        },
        numResidents: { $sum: 1 },
        location:     { $first: '$location' },
    },
};

const householdParts = (filter, dncStages, campaignID) => ({
    prefix: [
        { $match: filter },
        // Campaign 196 only counts some residents of each household
        ...(campaignID === 196 ? [makeSpecialFilter()] : []),
        ...dncStages,
    ],
    toHouseholds: [{ $project: { numResidents: { $size: '$residents' }, location: 1 } }],
    toResidents:  [{ $unwind: '$residents' }, { $project: { _id: 0, r: '$residents' } }],
});

const individualParts = (filter) => ({
    prefix:       [{ $match: filter }],
    toHouseholds: [INDIVIDUAL_BY_ADDRESS_STAGE],
    toResidents:  [{ $project: { _id: 0, r: '$resident' } }],
});

const membershipParts = (filter, orgID) => ({
    prefix: [
        { $match: { 'enrollment.orgID': orgID } },
        { $match: filter },
    ],
    toHouseholds: [GROUP_BY_ADDRESS_STAGE, { $project: { numResidents: { $size: '$residents' }, location: 1 } }],
    toResidents:  [{ $project: { _id: 0, r: '$resident' } }],
});

const COUNT_STAGE = {
    $group: {
        _id: null,
        totalHHs:       { $sum: 1 },
        totalResidents: { $sum: '$numResidents' },
    },
};

const LOCATION_STAGES = [
    { $match: { location: { $ne: null } } },
    { $sample: { size: MAX_MAP_LOCATIONS } },
    { $project: { _id: 0, location: 1 } },
];

/**
 * Facets computed from the prefix's output in one pass.
 * Phones counts residents with a valid phone (as hasValidPhoneCond, which activity generation uses).
 * Textable counts phone numbers, not people: a shared phone is texted once.
 * Numbers texting skips (landlines, failed sends) are left out.
 */
const buildFacets = (parts, invalidPhoneIDs, nonTextablePhones, withLocations) => {
    const validPhoneResidents = [...parts.toResidents, { $match: validPhoneMatch('r', invalidPhoneIDs) }];
    const facets = {
        counts: [...parts.toHouseholds, COUNT_STAGE],
        phones: [...validPhoneResidents, { $count: 'totalPhones' }],
        textable: [
            ...validPhoneResidents,
            { $project: { phone: { $arrayElemAt: ['$r.phones.number', 0] } } },
            { $match: { phone: { $ne: null, $nin: nonTextablePhones } } },
            { $group: { _id: '$phone' } },
            { $count: 'totalTextable' },
        ],
    };
    if (withLocations) facets.locations = [...parts.toHouseholds, ...LOCATION_STAGES];
    return facets;
};

// ─── Result shaping ───────────────────────────────────────────────────────────

/**
 * Determines whether to include map locations in the estimate response.
 * For INDIVIDUAL mode, locations are only returned when the group uses
 * polygon or temp_shape queries (i.e. map-drawn boundaries).
 */
const includeLocations = (groupBy, queries) => {
    if (groupBy === 'HOUSEHOLD') return true;
    if (groupBy === 'INDIVIDUAL') return 'polygons' in queries || 'temp_shape' in queries;
    // MEMBERSHIP: locations not meaningfully available
    return false;
};

const shapeResult = ({ counts: [counts], phones: [phones], textable: [textable], locations = [] }) => ({
    totalHHs:       counts.totalHHs,
    totalResidents: counts.totalResidents,
    totalPhones:    phones?.totalPhones ?? 0,
    totalTextable:  textable?.totalTextable ?? 0,
    locations:      locations.map((doc) => doc.location),
});

// ─── Main export ──────────────────────────────────────────────────────────────

const getEstimate = async (group) => {
    try {
        const campaign = await Campaign.findOne({ campaignID: group.campaignID });

        // Same org scope convertQueries uses for contact-record rules
        const orgScope = group.campaignWide ? { $in: campaign.orgIDs } : group.orgID;

        const [{ filter, dncStages }, invalidPhoneIDs, nonTextablePhones] = await Promise.all([
            buildBaseFilter(group, campaign),
            getInvalidPhonePersonIDs(orgScope),
            getNonTextablePhones(),
        ]);

        let parts;
        let Model;

        if (group.groupBy === 'HOUSEHOLD') {
            parts = householdParts(filter, dncStages, group.campaignID);
            Model = Household;
        } else if (group.groupBy === 'INDIVIDUAL') {
            parts = individualParts(filter);
            Model = People;
        } else if (group.groupBy === 'MEMBERSHIP') {
            parts = membershipParts(filter, group.orgID);
            Model = Membership;
        } else {
            throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
        }

        const facets = buildFacets(parts, invalidPhoneIDs, nonTextablePhones, includeLocations(group.groupBy, group.queries ?? {}));

        const [result] = await Model.aggregate([...parts.prefix, { $facet: facets }]).allowDiskUse(true);

        // maxHouseholds lets the client warn when an activity from this group would be capped
        if (!result?.counts.length) return { ...EMPTY_ESTIMATE, maxHouseholds: MAX_ACTIVITY_HOUSEHOLDS };

        return { ...shapeResult(result), maxHouseholds: MAX_ACTIVITY_HOUSEHOLDS };

    } catch (e) {
        throw e;
    }
};

module.exports = { getEstimate };
