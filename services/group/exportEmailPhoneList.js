const Districts  = require('../../models/campaigns/districts');
const Campaign   = require('../../models/campaigns/campaign');
const People     = require('../../models/people/people');
const Membership = require('../../models/people/membership');
const Household  = require('../../models/households/household');
const { buildBaseFilter } = require('./groupUtils');
const { getInvalidPhonePersonIDs } = require('./contactExclusions');
 
const EXPORT_LIMIT = 100_000;

const RESIDENT_FIELD_MAP = {

    firstName:  '$resident.name.firstName',
    lastName:   '$resident.name.lastName',
    middleName: '$resident.name.middleName',
    phone:      { $arrayElemAt: ['$resident.phones.number', 0] },
    email:      { $arrayElemAt: ['$resident.emails', 0] },
    party:      '$resident.party',
    ethnicity:  '$resident.ethnicity',
    age:        '$resident.age',
    party:      '$resident.party',
    address:    '$address',
    city:       '$address.city',
    zip:        '$address.zip',
    county:     '$county',
    precinctID: '$registrationPrecinctID',
    voterID:    '$resident.voterID',
    ampID:      '$resident.ampID',
};

const RESIDENTS_FIELD_MAP = {

    firstName:  '$residents.name.firstName',
    lastName:   '$residents.name.lastName',
    middleName: '$residents.name.middleName',
    phone:      { $arrayElemAt: ['$residents.phones.number', 0] },
    email:      { $arrayElemAt: ['$residents.emails', 0] },
    party:      '$residents.party',
    ethnicity:  '$residents.ethnicity',
    age:        '$residents.age',
    party:      '$residents.party',
    address:    '$address',
    city:       '$address.city',
    zip:        '$address.zip',
    county:     '$county',
    precinctID: '$registrationPrecinctID',
    voterID:    '$residents.voterID',
    ampID:      '$residents.ampID',
};
 
/**
 * $match stage that keeps only records where the resident has at least
 * one usable phone or one email. Prefix switches between post-$unwind household
 * fields ("residents") and People/Membership fields ("resident").
 * Phones reported invalid don't count as usable.
 *
 * @param {'residents'|'resident'} prefix
 * @param {Array<string>} invalidPhoneIDs
 */
const makeContactFilter = (prefix, invalidPhoneIDs) => ({
    $match: {
        $or: [
            {
                [`${prefix}.phones`]:   { $ne: [] },
                [`${prefix}.personID`]: { $nin: invalidPhoneIDs },
            },
            { [`${prefix}.emails`]: { $ne: [] } },
        ],
    },
});

/**
 * Blanks the phone of residents whose number was reported invalid,
 * so they can still be exported for their email.
 *
 * @param {'residents'|'resident'} prefix
 * @param {Array<string>} invalidPhoneIDs
 */
const makeInvalidPhoneStage = (prefix, invalidPhoneIDs) => ({
    $set: {
        [`${prefix}.phones`]: {
            $cond: [{ $in: [`$${prefix}.personID`, invalidPhoneIDs] }, [], `$${prefix}.phones`],
        },
    },
});
 
/**
 * Shared $project shape for People and Membership — individual-level docs
 * where every field lives directly on `resident` (singular).
 *
 * @param {Object} fields - Any additional fields to merge in (e.g. address shape)
 */
const makeResidentProject = (fields) => ({
    $project: fields.reduce((project, field) => {
        if (RESIDENT_FIELD_MAP[field]) {
            project[field] = RESIDENT_FIELD_MAP[field];
        }
        return project;
    }, {}),
});

const makeResidentsProject = (fields) => ({
    $project: fields.reduce((project, field) => {
        if (RESIDENTS_FIELD_MAP[field]) {
            project[field] = RESIDENTS_FIELD_MAP[field];
        }
        return project;
    }, {}),
});

const buildHouseholdExportAgg = (filter, dncStages, invalidPhoneIDs, fields) => [
    { $match: filter },
    ...dncStages,
    { $match: { 'residents.0': { $exists: true } } },
    { $unwind: '$residents' },
    makeContactFilter('residents', invalidPhoneIDs),
    makeInvalidPhoneStage('residents', invalidPhoneIDs),
    { $limit: EXPORT_LIMIT },
    makeResidentsProject(fields),
];
 
const buildIndividualExportAgg = (filter, invalidPhoneIDs, fields) => [
    { $match: filter },
    makeContactFilter('resident', invalidPhoneIDs),
    makeInvalidPhoneStage('resident', invalidPhoneIDs),
    { $limit: EXPORT_LIMIT },
    makeResidentProject(fields),
];
 
const buildMembershipExportAgg = (filter, orgID, invalidPhoneIDs, fields) => [
    { $match: { 'enrollment.orgID': orgID } },
    { $match: filter },
    makeContactFilter('resident', invalidPhoneIDs),
    makeInvalidPhoneStage('resident', invalidPhoneIDs),
    { $limit: EXPORT_LIMIT },
    makeResidentProject(fields),
];
 
// ─── Main export ──────────────────────────────────────────────────────────────
 
const exportEmailPhoneList = async (detail) => {
    try {

        let group = detail.group;
        let fields = detail.fields;
        const campaign = await Campaign.findOne({ campaignID: group.campaignID });
 
        // Same org scope convertQueries uses for contact-record rules
        const orgScope = group.campaignWide ? { $in: campaign.orgIDs } : group.orgID;

        const [{ filter, dncStages }, invalidPhoneIDs] = await Promise.all([
            buildBaseFilter(group, campaign),
            getInvalidPhonePersonIDs(orgScope),
        ]);
 
        if (group.groupBy === 'HOUSEHOLD') {
            const agg = buildHouseholdExportAgg(filter, dncStages, invalidPhoneIDs, fields);
            return Household.aggregate(agg).allowDiskUse(true);
 
        } else if (group.groupBy === 'INDIVIDUAL') {
            const agg = buildIndividualExportAgg(filter, invalidPhoneIDs, fields);
            return People.aggregate(agg).allowDiskUse(true);
 
        } else if (group.groupBy === 'MEMBERSHIP') {
            const agg = buildMembershipExportAgg(filter, group.orgID, invalidPhoneIDs, fields);
            return Membership.aggregate(agg).allowDiskUse(true);
 
        } else {
            throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
        }
 
    } catch (e) {
        throw e;
    }
};
 
module.exports = { exportEmailPhoneList };