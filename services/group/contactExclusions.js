const ActivityContactRecord = require('../../models/activities/activityContactRecord');
const TextRecord = require('../../models/activities/textbank/textRecords');

/**
 * personIDs marked Do Not Contact that must be kept out of every group,
 * export and activity on this campaign: any DNC recorded on the campaign
 * itself, plus any DNC recorded by an org that is part of the campaign
 * (so an org's DNCs follow it into future campaigns).
 *
 * @param {Object} campaign - Campaign document (campaignID, orgIDs)
 * @returns {Promise<Array<string>>}
 */
const getDncPersonIDs = (campaign) =>
    ActivityContactRecord.distinct('personID', {
        'nonResponse.nonResponseType': 'DNC',
        $or: [
            { campaignID: campaign.campaignID },
            { orgID: { $in: campaign.orgIDs || [] } },
        ],
    });

/**
 * personIDs whose phone number was reported invalid by the given org scope.
 *
 * @param {string|Object} orgScope - an orgID, or a mongo condition such as { $in: [...] }
 * @returns {Promise<Array<string>>}
 */
const getInvalidPhonePersonIDs = (orgScope) =>
    ActivityContactRecord.distinct('personID', {
        orgID: orgScope,
        'nonResponse.nonResponseType': 'INVALIDPHONE',
    });

/**
 * personIDs that texting skips: a lookup found a non-mobile line, or a send failed.
 * Not org-scoped; these records describe the number itself.
 *
 * @returns {Promise<Array<string>>}
 */
const getNonTextablePersonIDs = () =>
    TextRecord.distinct('personID', {
        $or: [{ deviceType: { $ne: 'mobile' } }, { error: true }],
    });

module.exports = { getDncPersonIDs, getInvalidPhonePersonIDs, getNonTextablePersonIDs };
