const Campaign        = require('../../models/campaigns/campaign');
const Household       = require('../../models/households/household');
const People          = require('../../models/people/people');
const Membership      = require('../../models/people/membership');
const GroupByPrecinct = require('../../models/groups/groupbyprecinct');
const { buildBaseFilter, makeSpecialFilter } = require('./groupUtils');
 
// ─── Aggregation builders ─────────────────────────────────────────────────────
 
const buildHouseholdPrecinctAgg = (filter, dncStages, groupID) => [
    { $match: filter },
    ...dncStages,
    { $project: { numResidents: { $size: '$residents' }, registrationPrecinctID: 1 } },
    {
        $group: {
            _id: {
                precinctID: '$registrationPrecinctID',
                groupID,
            },
            households: { $sum: 1 },
            residents:  { $sum: '$numResidents' },
        },
    },
    {
        $project: {
            _id:        0,
            precinctID: '$_id.precinctID',
            groupID:    '$_id.groupID',
            households: 1,
            residents:  1,
        },
    },
    {
        $merge: {
            into:           'groupbyprecinct',
            whenMatched:    'replace',
            whenNotMatched: 'insert',
        },
    },
];
 
/**
 * Groups People docs by address first (to get household counts), then rolls
 * up to precinct level. Also tracks hispanic and democratic resident counts.
 * Uses $merge to persist results into groupbyprecinct, then re-queries.
 */
const buildIndividualPrecinctAgg = (filter, groupID) => [
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
            numResidents:           { $sum: 1 },
            registrationPrecinctID: { $first: '$registrationPrecinctID' },
        },
    },
    {
        $group: {
            _id: {
                precinctID: '$registrationPrecinctID',
                groupID,
            },
            households:           { $sum: 1 },
            residents:            { $sum: '$numResidents' },
        },
    },
    {
        $project: {
            _id:                  0,
            precinctID:           '$_id.precinctID',
            groupID:              '$_id.groupID',
            households:           1,
            residents:            1,
        },
    },
    {
        $merge: {
            into:           'groupbyprecinct',
            whenMatched:    'replace',
            whenNotMatched: 'insert',
        },
    },
];
 
/**
 * Groups Membership docs by address then rolls up to precinct level.
 * Scoped to the org via enrollment.orgID.
 */
const buildMembershipPrecinctAgg = (filter, orgID, groupID) => [
    { $match: { 'enrollment.orgID': orgID } },
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
            numResidents:           { $sum: 1 },
            registrationPrecinctID: { $first: '$registrationPrecinctID' },
        },
    },
    {
        $group: {
            _id:              '$registrationPrecinctID',
            households:       { $sum: 1 },
            residents:        { $sum: '$numResidents' },
        },
    },
    {
        $addFields: { groupID },
    },
];
 
// ─── Main export ──────────────────────────────────────────────────────────────
 
const getGroupByPrecinct = async (group) => {
    // Return cached precinct data if it already exists.
    const cached = await GroupByPrecinct.find({ groupID: group._id }, { _id: 0 });
    if (cached.length > 0) return cached;
 
    const campaign = await Campaign.findOne({ campaignID: group.campaignID });
 
    const { filter, dncStages } = await buildBaseFilter(group, campaign);
 
    // This query requires a valid precinct — enforce it after buildBaseFilter.
    filter['registrationPrecinctID'] = { $exists: true, $ne: null };
 
    if (group.groupBy === 'HOUSEHOLD') {
        const agg = buildHouseholdPrecinctAgg(filter, dncStages, group._id);
        if (group.campaignID === 196) agg.splice(1, 0, makeSpecialFilter());

        await Household.aggregate(agg).allowDiskUse(true);

        const results = await GroupByPrecinct.find({ groupID: group._id }, { _id: 0 });
        return results;
 
    } else if (group.groupBy === 'INDIVIDUAL') {
        const agg = buildIndividualPrecinctAgg(filter, group._id);
        await People.aggregate(agg).allowDiskUse(true);
 
        // $merge wrote results to groupbyprecinct — now fetch them.
        const results = await GroupByPrecinct.find({ groupID: group._id }, { _id: 0 });
        return results; // returns [] if nothing was written, never undefined
 
    } else if (group.groupBy === 'MEMBERSHIP') {
        const agg = buildMembershipPrecinctAgg(filter, group.orgID, group._id);
        await Membership.aggregate(agg).allowDiskUse(true);
 
        const results = await GroupByPrecinct.find({ groupID: group._id }, { _id: 0 });
        return results;
 
    } else {
        throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
    }
};
 
module.exports = { getGroupByPrecinct };