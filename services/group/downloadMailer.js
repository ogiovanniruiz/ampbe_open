const Membership = require('../../models/people/membership');
const Campaign   = require('../../models/campaigns/campaign');
const Household  = require('../../models/households/household');
const People     = require('../../models/people/people');
const { buildBaseFilter, GROUP_BY_ADDRESS_STAGE } = require('./groupUtils');
 
const buildHouseholdMailerAgg = (filter, dncStages) => [
    { $match: filter },
    ...dncStages,
    { $match: { 'residents.0': { $exists: true } } },
    { $limit: 100_000 },
];
 
const buildIndividualMailerAgg = (filter) => [
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
            fullAddress1: { $first: '$fullAddress1' },
            fullAddress2: { $first: '$fullAddress2' },
            residents:    { $push: '$resident' },
            location:     { $first: '$location' },
            hhParties:    { $first: '$hhParties' },
            districts:    { $first: '$districts' },
        },
    },
    { $limit: 100_000 },
];
 
const buildMembershipMailerAgg = (filter, orgID) => [
    { $match: { 'enrollment.orgID': orgID } },
    { $match: filter },
    { $limit: 100_000 },
    {
        $project: {
            name:   '$resident.name',
            phones: '$resident.phones',
            emails: '$resident.emails',
        },
    },
];
 
// ─── Main export ──────────────────────────────────────────────────────────────
 
const downloadMailer = async (group) => {
    try {
        const campaign = await Campaign.findOne({ campaignID: group.campaignID });
 
        const { filter, dncStages } = await buildBaseFilter(group, campaign);
 
        if (group.groupBy === 'HOUSEHOLD') {
            const agg = buildHouseholdMailerAgg(filter, dncStages);
            return Household.aggregate(agg).allowDiskUse(true);
 
        } else if (group.groupBy === 'INDIVIDUAL') {
            const agg = buildIndividualMailerAgg(filter);
            return People.aggregate(agg).allowDiskUse(true);
 
        } else if (group.groupBy === 'MEMBERSHIP') {
            const agg = buildMembershipMailerAgg(filter, group.orgID);
            return Membership.aggregate(agg).allowDiskUse(true);
 
        } else {
            throw new Error(`Unknown groupBy value: "${group.groupBy}"`);
        }
 
    } catch (e) {
        throw e;
    }
};
 
module.exports = { downloadMailer };
 