const Campaign             = require('../../models/campaigns/campaign');
const Group                = require('../../models/groups/group');
const ActivityContactRecord = require('../../models/activities/activityContactRecord');
const { buildBaseFilter, hasPhonesCond, GROUP_BY_ADDRESS_STAGE, makeSpecialFilter } = require('./groupUtils');
const { getNonTextablePersonIDs } = require('./contactExclusions');

// ─── Exclusion helpers ────────────────────────────────────────────────────────

/**
 * Collects personIDs to exclude from the contact list based on activity type.
 * Runs all eligible DB lookups concurrently.
 *
 * @param {Object} activity
 * @returns {Promise<Array>} Deduplicated array of personIDs to exclude
 */
const buildExcludedPersonIDs = async (activity) => {
    const { activityType, orgIDs } = activity;
    const orgID = orgIDs[0];
    const promises = [];

    if (activityType === 'Texting') {
        promises.push(
            getNonTextablePersonIDs().then((ids) => ids.map((personID) => ({ personID })))
        );
    }

    if (activityType === 'Texting' || activityType === 'Phonebank') {
        promises.push(
            ActivityContactRecord.find(
                {
                    orgID,
                    'nonResponse.nonResponseType': 'INVALIDPHONE',
                },
                { personID: 1 }
            )
        );
    }

    if (activityType === 'Canvass') {
        promises.push(
            ActivityContactRecord.find(
                {
                    orgID,
                    $or: [
                        { 'nonResponse.nonResponseType': 'INVALIDADDRESS' },
                        { 'nonResponse.nonResponse': 'Inaccessible' },
                    ],
                },
                { personID: 1 }
            )
        );
    }

    const results = await Promise.all(promises);
    const allIDs = results.flat().map((r) => r.personID);
    return [...new Set(allIDs)];
};

// ─── Pipeline stage factories ─────────────────────────────────────────────────

/**
 * $project stage that strips residents without a valid phone.
 * Applied for Phonebank and Texting activity types.
 */
const makePhoneFilter = () => ({
    $project: {
        _id: 1,
        residents: {
            $filter: {
                input: '$residents',
                as: 'residents',
                cond: hasPhonesCond('$$residents'),
            },
        },
        fullAddress1:           1,
        fullAddress2:           1,
        accuracyType:           1,
        location:               1,
        county:                 1,
        hhParties:              1,
        districts:              1,
        electionPrecinctID:     1,
        registrationPrecinctID: 1,
    },
});

/**
 * $project stage that strips residents whose personID is in the exclusion list.
 *
 * @param {Array} excludedObjects - Array of personIDs to exclude
 */
const makeExclusionFilter = (excludedObjects) => ({
    $project: {
        _id: 1,
        residents: {
            $filter: {
                input: '$residents',
                as: 'residents',
                cond: { $not: { $in: ['$$residents.personID', excludedObjects] } },
            },
        },
        fullAddress1:           1,
        fullAddress2:           1,
        accuracyType:           1,
        location:               1,
        county:                 1,
        hhParties:              1,
        districts:              1,
        electionPrecinctID:     1,
        registrationPrecinctID: 1,
    },
});

/**
 * Assembles the shared tail of every pipeline variant:
 * filter phones → exclude persons → filter canvass accuracy →
 * drop empty households → cap results → shape output document.
 *
 * @param {string} activityId
 * @param {number} limit
 * @param {Object} phoneFilter
 * @param {Object} exclusionFilter
 * @param {Object} canvassFilter
 * @param {Object} specialFilter
 */
const makeTailStages = (activityId, limit, phoneFilter, exclusionFilter, canvassFilter, specialFilter) => [
    phoneFilter,
    exclusionFilter,
    canvassFilter,
    specialFilter,
    { $match: { 'residents.0': { $exists: true } } },
    { $limit: limit },
    { $project: { _id: 0, activityID: activityId, household: '$$ROOT' } },
    { $addFields: { complete: false, passed: false, locked: false } },
];

// ─── Main export ──────────────────────────────────────────────────────────────

const generateGroupResults = async (activity) => {
    try {
        // Fetch group, campaign, and exclusions concurrently — none depend on each other.
        const [group, campaign, activityExclusions] = await Promise.all([
            Group.findOne({ _id: activity.groupID }),
            Campaign.findOne({ campaignID: activity.campaignID }),
            buildExcludedPersonIDs(activity),
        ]);

        const { filter, dncPersonIDs } = await buildBaseFilter(group, campaign);

        // DNC people are stripped resident-by-resident along with the activity-type exclusions
        const excludedObjects = [...new Set([...activityExclusions, ...dncPersonIDs])];

        // ── Per-activity-type pipeline stages ─────────────────────────────────
        const isPhoneActivity = activity.activityType === 'Phonebank' || activity.activityType === 'Texting';

        const phoneFilter     = isPhoneActivity          ? makePhoneFilter()                   : { $match: {} };
        const exclusionFilter = excludedObjects.length   ? makeExclusionFilter(excludedObjects) : { $match: {} };
        const canvassFilter   = activity.activityType === 'Canvass'
            ? { $match: { accuracyType: { $nin: ['place', 'street_center'] } } }
            : { $match: {} };

        const specialFilter = activity.campaignID === 196 ? makeSpecialFilter() : { $match: {} };

        const activityId = activity._id.toString();
        const tail = makeTailStages(
            activityId,
            group.groupBy === 'HOUSEHOLD' ? 100_000 : 500_000,
            phoneFilter,
            exclusionFilter,
            canvassFilter,
            specialFilter
        );

        // ── Build pipeline by groupBy mode ────────────────────────────────────
        let agg;

        if (group.groupBy === 'HOUSEHOLD') {
            agg = [
                { $match: filter },
                ...tail,
            ];
        } else if (group.groupBy === 'INDIVIDUAL') {
            agg = [
                { $match: filter },
                GROUP_BY_ADDRESS_STAGE,
                ...tail,
            ];
        } else if (group.groupBy === 'MEMBERSHIP') {
            agg = [
                { $match: { 'enrollment.orgID': activity.orgIDs[0] } },
                { $match: filter },
                GROUP_BY_ADDRESS_STAGE,
                ...tail,
            ];
        } else {
            throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
        }

        return { agg, groupBy: group.groupBy };

    } catch (e) {
        throw e;
    }
};

const steyerprovision = () => {

}

module.exports = { generateGroupResults };
