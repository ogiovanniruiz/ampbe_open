const Districts = require('../../models/campaigns/districts');
const convertQueries = require('./convertQueries');
const { getDncPersonIDs } = require('./contactExclusions');

/**
 * Builds the base MongoDB filter from group queries + campaign district boundary.
 * Used by both getEstimate and generateGroupResults.
 *
 * @param {Object} group    - Group document from MongoDB
 * @param {Object} campaign - Campaign document from MongoDB
 * @returns {{ filter: Object, boundary: Array }} - Ready-to-use $match filter and raw boundary docs
 */
const buildBaseFilter = async (group, campaign) => {
    // People marked Do Not Contact never appear in any group, export or activity
    const dncPersonIDs = await getDncPersonIDs(campaign);

    // Always convert, even without queries, so DNC exclusions are applied
    const filter = await convertQueries.convertQueries(group, campaign, dncPersonIDs);

    const boundary = await Districts.find({
        'properties.identifier': { $in: campaign.boundaryIDs },
    });

    if (!boundary.length) {
        throw new Error(`No district boundary found for campaignID "${campaign.campaignID}"`);
    }

    const districtTypeParam =
        'districts.' + boundary[0].properties.districtType.toLowerCase() + 'ID';
    const districtTypeSet = boundary.map((b) => b.properties.identifier);

    if (!group.queries?.ignoreDistrict && !group.queries?.districts) {
        filter[districtTypeParam] = { $in: districtTypeSet };
    }

    // HOUSEHOLD docs can't be excluded whole for one DNC resident, so callers
    // append these stages right after { $match: filter } to strip them instead.
    const dncStages = group.groupBy === 'HOUSEHOLD' && dncPersonIDs.length
        ? makeResidentExclusionStages(dncPersonIDs)
        : [];

    return { filter, boundary, dncPersonIDs, dncStages };
};

/**
 * Removes residents whose personID is in excludedIDs from household-shaped
 * docs, then drops households left with no residents.
 *
 * @param {Array<string>} excludedIDs
 */
const makeResidentExclusionStages = (excludedIDs) => [
    {
        $set: {
            residents: {
                $filter: {
                    input: '$residents',
                    as: 'r',
                    cond: { $not: [{ $in: ['$$r.personID', excludedIDs] }] },
                },
            },
        },
    },
    { $match: { 'residents.0': { $exists: true } } },
];

/**
 * Returns a MongoDB boolean expression that is true when a resident
 * has at least one phone number not flagged invalidnumber.
 * Shared by estimates and phone/text activity generation so their counts agree.
 *
 * @param {string} residentRef - The pipeline variable reference, e.g. "$$r" or "$$residents"
 */
const hasPhonesCond = (residentRef) => ({
    $and: [
        { $isArray: `${residentRef}.phones` },
        { $gt: [{ $size: `${residentRef}.phones` }, 0] },
        { $ne: [`${residentRef}.invalidnumber`, true] },
    ],
});

/**
 * Like hasPhonesCond, but also false when the resident's number was
 * reported invalid (personID in invalidPhoneIDs).
 *
 * @param {string} residentRef
 * @param {Array<string>} invalidPhoneIDs
 */
const hasValidPhoneCond = (residentRef, invalidPhoneIDs = []) => ({
    $and: [
        hasPhonesCond(residentRef),
        { $not: [{ $in: [`${residentRef}.personID`, invalidPhoneIDs] }] },
    ],
});

/**
 * Query-language form of hasValidPhoneCond for a $match on one-resident docs; keep the two in step.
 * $nin in a $match is a set lookup, while $in inside an expression scans the whole
 * invalidPhoneIDs list for every resident (tens of thousands of IDs on large campaigns).
 *
 * @param {string} residentPath - Path to the resident, e.g. "r"
 * @param {Array<string>} invalidPhoneIDs
 */
const validPhoneMatch = (residentPath, invalidPhoneIDs = []) => ({
    [`${residentPath}.phones.0`]:      { $exists: true },
    [`${residentPath}.invalidnumber`]: { $ne: true },
    [`${residentPath}.personID`]:      { $nin: invalidPhoneIDs },
});

/**
 * Shared address-level $group stage.
 * Collapses individual People/Membership docs into household-shaped groups.
 * Used by generateGroupResults (INDIVIDUAL, MEMBERSHIP) and
 * getEstimate (INDIVIDUAL, MEMBERSHIP).
 */
const GROUP_BY_ADDRESS_STAGE = {
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
        residents:              { $push: '$resident' },
        fullAddress1:           { $first: '$fullAddress1' },
        fullAddress2:           { $first: '$fullAddress2' },
        accuracyType:           { $first: '$accuracyType' },
        county:                 { $first: '$county' },
        location:               { $first: '$location' },
        hhParties:              { $first: '$hhParties' },
        districts:              { $first: '$districts' },
        electionPrecinctID:     { $first: '$electionPrecinctID' },
        registrationPrecinctID: { $first: '$registrationPrecinctID' },
    },
};

/**
 * Standard zero-result estimate shape.
 * Both HOUSEHOLD and INDIVIDUAL/MEMBERSHIP branches return this on empty results.
 */
const EMPTY_ESTIMATE = Object.freeze({
    totalHHs:      0,
    totalResidents: 0,
    totalPhones:   0,
    totalTextable: 0,
    locations:     [],
});

const makeSpecialFilter = () => ({
    $project: {
        _id: 1,
        residents: {
            $filter: {
                input: '$residents',
                as: 'resident',
                cond: {
                    $and: [
                        {
                            $or: [
                                { $eq: ['$$resident.steyer1', true] },
                                { $eq: ['$$resident.steyer2', true] },
                                { $eq: ['$$resident.steyer3', true] },
                                { $eq: ['$$resident.party', 'DEM'] },
                            ],
                        },
                        {
                            $ne: ['$$resident.voted_current_cycle', true],
                        },
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

module.exports = {
    buildBaseFilter,
    hasPhonesCond,
    hasValidPhoneCond,
    validPhoneMatch,
    GROUP_BY_ADDRESS_STAGE,
    makeSpecialFilter,
    EMPTY_ESTIMATE,
};
