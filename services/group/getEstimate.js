const Campaign    = require('../../models/campaigns/campaign');
const Household   = require('../../models/households/household');
const People      = require('../../models/people/people');
const Membership  = require('../../models/people/membership');
const { buildBaseFilter, hasValidPhoneCond, GROUP_BY_ADDRESS_STAGE, EMPTY_ESTIMATE, makeSpecialFilter } = require('./groupUtils');
const { getInvalidPhonePersonIDs, getNonTextablePersonIDs } = require('./contactExclusions');

// Cap on locations returned for the mini-map. Each one becomes a Leaflet marker,
// and pushing every location into one document exceeded MongoDB's 16MB limit.
const MAX_MAP_LOCATIONS = 5000;

// ─── Aggregation builders ─────────────────────────────────────────────────────
// Each builder returns the stages that produce one household-shaped document
// with numResidents, numPhones, numTextable and location; the count and location stages
// below are appended to them.

const COUNT_STAGE = {
    $group: {
        _id: null,
        totalHHs:       { $sum: 1 },
        totalResidents: { $sum: '$numResidents' },
        totalPhones:    { $sum: '$numPhones' },
        totalTextable:  { $sum: '$numTextable' },
    },
};

const LOCATION_STAGES = [
    { $match: { location: { $ne: null } } },
    { $sample: { size: MAX_MAP_LOCATIONS } },
    { $project: { _id: 0, location: 1 } },
];

/**
 * Counts households, residents, and phone-holding residents directly from
 * the Household collection (already household-shaped documents).
 */
const buildHouseholdEstimateAgg = (filter, dncStages, invalidPhoneIDs, textExcludedIDs) => [
    { $match: filter },
    ...dncStages,
    {
        $project: {
            numResidents: { $size: '$residents' },
            numPhones: {
                $size: {
                    $filter: {
                        input: '$residents',
                        as: 'r',
                        cond: hasValidPhoneCond('$$r', invalidPhoneIDs),
                    },
                },
            },
            numTextable: {
                $size: {
                    $filter: {
                        input: '$residents',
                        as: 'r',
                        cond: hasValidPhoneCond('$$r', textExcludedIDs),
                    },
                },
            },
            location: '$location',
        },
    },
];

/**
 * Counts households, residents, and phone-holding residents from the People
 * collection by first grouping individuals back into address-level households.
 */
const buildIndividualEstimateAgg = (filter, invalidPhoneIDs, textExcludedIDs) => [
    { $match: filter },
    {
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
            numPhones: {
                $sum: {
                    $cond: [hasValidPhoneCond('$resident', invalidPhoneIDs), 1, 0],
                },
            },
            numTextable: {
                $sum: {
                    $cond: [hasValidPhoneCond('$resident', textExcludedIDs), 1, 0],
                },
            },
            location: { $first: '$location' },
        },
    },
];

/**
 * Counts households, residents, and phone-holding residents from the Membership
 * collection, scoped to the given org, then grouped by address.
 */
const buildMembershipEstimateAgg = (filter, orgID, invalidPhoneIDs, textExcludedIDs) => [
    { $match: { 'enrollment.orgID': orgID } },
    { $match: filter },
    GROUP_BY_ADDRESS_STAGE,
    {
        $project: {
            numResidents: { $size: '$residents' },
            numPhones: {
                $size: {
                    $filter: {
                        input: '$residents',
                        as: 'r',
                        cond: hasValidPhoneCond('$$r', invalidPhoneIDs),
                    },
                },
            },
            numTextable: {
                $size: {
                    $filter: {
                        input: '$residents',
                        as: 'r',
                        cond: hasValidPhoneCond('$$r', textExcludedIDs),
                    },
                },
            },
            location: '$location',   // GROUP_BY_ADDRESS_STAGE collects location via $first
        },
    },
];

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

const shapeResult = (counts, locations) => ({
    totalHHs:       counts.totalHHs,
    totalResidents: counts.totalResidents,
    totalPhones:    counts.totalPhones,
    totalTextable:  counts.totalTextable,
    locations:      locations.map((doc) => doc.location),
});

// ─── Main export ──────────────────────────────────────────────────────────────

const getEstimate = async (group) => {
    try {
        const campaign = await Campaign.findOne({ campaignID: group.campaignID });

        // Same org scope convertQueries uses for contact-record rules
        const orgScope = group.campaignWide ? { $in: campaign.orgIDs } : group.orgID;

        const [{ filter, dncStages }, invalidPhoneIDs, nonTextableIDs] = await Promise.all([
            buildBaseFilter(group, campaign),
            getInvalidPhonePersonIDs(orgScope),
            getNonTextablePersonIDs(),
        ]);

        // Textable = phones minus numbers texting skips (landlines, failed sends)
        const textExcludedIDs = [...new Set([...invalidPhoneIDs, ...nonTextableIDs])];

        let agg;
        let Model;

        if (group.groupBy === 'HOUSEHOLD') {
            agg   = buildHouseholdEstimateAgg(filter, dncStages, invalidPhoneIDs, textExcludedIDs);
            Model = Household;
        } else if (group.groupBy === 'INDIVIDUAL') {
            agg   = buildIndividualEstimateAgg(filter, invalidPhoneIDs, textExcludedIDs);
            Model = People;
        } else if (group.groupBy === 'MEMBERSHIP') {
            agg   = buildMembershipEstimateAgg(filter, group.orgID, invalidPhoneIDs, textExcludedIDs);
            Model = Membership;
        } else {
            throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
        }

        if (group.campaignID === 196 && group.groupBy === 'HOUSEHOLD') {
            agg.splice(1, 0, makeSpecialFilter());
        }

        const [[counts], locations] = await Promise.all([
            Model.aggregate([...agg, COUNT_STAGE]).allowDiskUse(true),
            includeLocations(group.groupBy, group.queries ?? {})
                ? Model.aggregate([...agg, ...LOCATION_STAGES]).allowDiskUse(true)
                : [],
        ]);

        if (!counts) return { ...EMPTY_ESTIMATE };

        return shapeResult(counts, locations);

    } catch (e) {
        throw e;
    }
};

module.exports = { getEstimate };
