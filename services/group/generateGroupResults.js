const Campaign             = require('../../models/campaigns/campaign');
const Group                = require('../../models/groups/group');
const ActivityContactRecord = require('../../models/activities/activityContactRecord');
const { buildBaseFilter, hasPhonesCond, GROUP_BY_ADDRESS_STAGE, makeSpecialFilter } = require('./groupUtils');
const { getNonTextablePhones } = require('./contactExclusions');

// Most households an activity is built with, whatever the group type. Groups above it are
// warned about in the estimate, and activities that reach it are flagged hhCapped.
const MAX_ACTIVITY_HOUSEHOLDS = 150_000;

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
 * $project stage that strips residents whose personID is in the exclusion list,
 * or whose first phone (the number texting uses) is in the excluded phones.
 *
 * @param {Array} excludedObjects - Array of personIDs to exclude
 * @param {Array} excludedPhones - Array of phone numbers to exclude
 */
const makeExclusionFilter = (excludedObjects, excludedPhones = []) => ({
    $project: {
        _id: 1,
        residents: {
            $filter: {
                input: '$residents',
                as: 'residents',
                cond: {
                    $and: [
                        { $not: { $in: ['$$residents.personID', excludedObjects] } },
                        { $not: { $in: [{ $arrayElemAt: ['$$residents.phones.number', 0] }, excludedPhones] } },
                    ],
                },
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
 * $match on one-person docs (INDIVIDUAL, MEMBERSHIP) with the same exclusions as
 * makeExclusionFilter, applied before grouping. In a query $match the lists are a set
 * lookup; in makeExclusionFilter's $filter they're scanned in full for every resident.
 * The personIDs go in a $nor of two lists so no index can serve it: with one list the
 * planner may scan the whole personID index instead of using the group's own rules.
 *
 * @param {Array} excludedObjects - Array of personIDs to exclude
 * @param {Array} excludedPhones - Array of phone numbers to exclude (checked against the first phone)
 * @returns {Object|null} null when there is nothing to exclude
 */
const makePersonExclusionMatch = (excludedObjects, excludedPhones = []) => {
    const match = {};
    if (excludedObjects.length) {
        const half = Math.ceil(excludedObjects.length / 2);
        match['$nor'] = [
            { 'resident.personID': { $in: excludedObjects.slice(0, half) } },
            { 'resident.personID': { $in: excludedObjects.slice(half) } },
        ];
    }
    if (excludedPhones.length) match['resident.phones.0.number'] = { $nin: excludedPhones };
    return Object.keys(match).length ? { $match: match } : null;
};

/**
 * Stages that keep one resident per phone number, so a shared phone is texted once.
 * The first resident in household order keeps the number; resident order is restored after.
 * Applied for Texting only.
 */
const makeDuplicatePhoneStages = () => [
    { $unwind: { path: '$residents', includeArrayIndex: 'residentIndex' } },
    { $sort: { _id: 1, residentIndex: 1 } },
    { $group: { _id: { $arrayElemAt: ['$residents.phones.number', 0] }, doc: { $first: '$$ROOT' } } },
    {
        $group: {
            _id:                    '$doc._id',
            residents:              { $push: { i: '$doc.residentIndex', r: '$doc.residents' } },
            fullAddress1:           { $first: '$doc.fullAddress1' },
            fullAddress2:           { $first: '$doc.fullAddress2' },
            accuracyType:           { $first: '$doc.accuracyType' },
            location:               { $first: '$doc.location' },
            county:                 { $first: '$doc.county' },
            hhParties:              { $first: '$doc.hhParties' },
            districts:              { $first: '$doc.districts' },
            electionPrecinctID:     { $first: '$doc.electionPrecinctID' },
            registrationPrecinctID: { $first: '$doc.registrationPrecinctID' },
        },
    },
    {
        $set: {
            residents: {
                $map: {
                    input: { $sortArray: { input: '$residents', sortBy: { i: 1 } } },
                    as: 'entry',
                    in: '$$entry.r',
                },
            },
        },
    },
];

/**
 * Assembles the shared tail of every pipeline variant:
 * filter phones → exclude persons and phones → filter canvass accuracy →
 * one resident per phone (texting) → drop empty households → cap results → shape output document.
 *
 * @param {string} activityId
 * @param {number} limit
 * @param {Object} phoneFilter
 * @param {Object} exclusionFilter
 * @param {Object} canvassFilter
 * @param {Object} specialFilter
 * @param {Array} duplicatePhoneStages
 */
const makeTailStages = (activityId, limit, phoneFilter, exclusionFilter, canvassFilter, specialFilter, duplicatePhoneStages) => [
    phoneFilter,
    exclusionFilter,
    canvassFilter,
    specialFilter,
    ...duplicatePhoneStages,
    { $match: { 'residents.0': { $exists: true } } },
    { $limit: limit },
    { $project: { _id: 0, activityID: activityId, household: '$$ROOT' } },
    { $addFields: { complete: false, passed: false, locked: false } },
];

// ─── Main export ──────────────────────────────────────────────────────────────

const generateGroupResults = async (activity) => {
    try {
        // Fetch group, campaign, and exclusions concurrently — none depend on each other.
        // Texting also skips numbers a lookup found non-mobile or that failed to send.
        const [group, campaign, activityExclusions, excludedPhones] = await Promise.all([
            Group.findOne({ _id: activity.groupID }),
            Campaign.findOne({ campaignID: activity.campaignID }),
            buildExcludedPersonIDs(activity),
            activity.activityType === 'Texting' ? getNonTextablePhones() : [],
        ]);

        const { filter, dncPersonIDs } = await buildBaseFilter(group, campaign);

        // DNC people are stripped resident-by-resident along with the activity-type exclusions
        const excludedObjects = [...new Set([...activityExclusions, ...dncPersonIDs])];

        // ── Per-activity-type pipeline stages ─────────────────────────────────
        const isPhoneActivity = activity.activityType === 'Phonebank' || activity.activityType === 'Texting';

        // INDIVIDUAL and MEMBERSHIP docs are one person each, so they're excluded before grouping
        const personExclusion = group.groupBy === 'HOUSEHOLD' ? null : makePersonExclusionMatch(excludedObjects, excludedPhones);
        const personStages    = personExclusion ? [personExclusion] : [];

        const phoneFilter     = isPhoneActivity          ? makePhoneFilter()                   : { $match: {} };
        const exclusionFilter = group.groupBy === 'HOUSEHOLD' && (excludedObjects.length || excludedPhones.length)
            ? makeExclusionFilter(excludedObjects, excludedPhones)
            : { $match: {} };
        const canvassFilter   = activity.activityType === 'Canvass'
            ? { $match: { accuracyType: { $nin: ['place', 'street_center'] } } }
            : { $match: {} };

        const specialFilter = activity.campaignID === 196 ? makeSpecialFilter() : { $match: {} };

        const duplicatePhoneStages = activity.activityType === 'Texting' ? makeDuplicatePhoneStages() : [];

        const activityId = activity._id.toString();
        const tail = makeTailStages(
            activityId,
            MAX_ACTIVITY_HOUSEHOLDS,
            phoneFilter,
            exclusionFilter,
            canvassFilter,
            specialFilter,
            duplicatePhoneStages
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
                ...personStages,
                GROUP_BY_ADDRESS_STAGE,
                ...tail,
            ];
        } else if (group.groupBy === 'MEMBERSHIP') {
            agg = [
                { $match: { 'enrollment.orgID': activity.orgIDs[0] } },
                { $match: filter },
                ...personStages,
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

module.exports = { generateGroupResults, MAX_ACTIVITY_HOUSEHOLDS };
