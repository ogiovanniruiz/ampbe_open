const Polygon = require('../../models/shapes/polygon')
const activityContactRecord = require('../../models/activities/activityContactRecord');
const Districts = require('../../models/campaigns/districts');
const { splitConsentTags, TEXTING_OPTIN, EMAIL_OPTIN } = require('../membership/consent');
const { tagValueClause } = require('../membership/memberTags');

// Rules whose form value is a [start, end] date range rather than a single selection
const DATE_RANGE_KEYS = ['date_contacted', 'regDate'];

// dncPersonIDs: people marked Do Not Contact. For INDIVIDUAL/MEMBERSHIP groups
// (one doc per person) they are excluded here; HOUSEHOLD docs hold several
// residents, so callers strip DNC residents per-resident instead (see groupUtils).
const convertQueries = async(estimate, campaign, dncPersonIDs = []) =>{
    console.log('converting queries with new function')

    const { queries, orgID, campaignID } = estimate;

    // Contact-record filters look at every org on the campaign when campaign-wide,
    // otherwise only at the signed-in org
    const orgScope = estimate.campaignWide ? { $in: campaign.orgIDs } : orgID;

    const ctx = {
      orgID,
      orgScope,
      campaignID,
      groupBy: estimate.groupBy,
      checkingContactRecords: false,
      inclusionQuery:  { orgID: orgScope },
      includedPersonIDs: [],
      excludedPersonIDs: [],
    };

    let convertedObject = {};

    // Uploaded members have neither a voterID nor a pdiID, so only voter-based groups require them
    if(estimate.groupBy !== 'MEMBERSHIP') {
      convertedObject = {'resident.voterID': {$exists: true, $ne: null}};
      convertedObject['resident.pdiID'] = { $exists: true, $ne: "" };
    }

    for (const [key, rawValue] of Object.entries(queries || {})) {
        const value = DATE_RANGE_KEYS.includes(key) ? rawValue : rawValue[0];
        const handler = HANDLERS[key];

        if (handler) {
          await handler(value, convertedObject, ctx);
        } else {
          convertedObject[`resident.${key}`] = { $in: value };
        }
    }

    if (ctx.checkingContactRecords) {
      let ids = await activityContactRecord
        .find(ctx.inclusionQuery, 'person.resident.personID')
        .lean();
      const excluded = new Set([...ctx.excludedPersonIDs, ...dncPersonIDs]);
      ids = extractPersonIDs(ids).filter(id => !excluded.has(id));
      convertedObject['resident.personID'] = { $in: ids };

    } else {
      const excluded = estimate.groupBy === 'HOUSEHOLD'
        ? ctx.excludedPersonIDs
        : [...ctx.excludedPersonIDs, ...dncPersonIDs];
      if (excluded.length > 0) convertedObject['resident.personID'] = { $nin: excluded };
    }

    if (estimate.groupBy === 'HOUSEHOLD') {
        for (const key of Object.keys(convertedObject)) {
          if (key.startsWith('resident.')) {
            convertedObject[key.replace('resident.', 'residents.')] = convertedObject[key];
            delete convertedObject[key];
          }

        if (key.startsWith('address.')) {
            convertedObject[key.replace('address.', '_id.')] = convertedObject[key];
            delete convertedObject[key];
          }
        }

        // Also rename keys nested inside $or/$and/$nor clauses
        convertedObject = renameResidentKeys(convertedObject);
    }

    return convertedObject;

}

//////////////HELPER FUNCTIONS////////////////

const HANDLERS = {

age: (value, obj) => {
  const ranges = {
    youth:   [18, 35],
    middle:  [36, 66],
    retired: [67, 120],
  };

  const selected = value.map(v => ranges[v]).filter(Boolean);

  if (selected.length === 1) {
    const [start, end] = selected[0];
    obj['resident.age'] = { $gte: start, $lte: end };
  } else {
    addOrClause(obj, selected.map(([start, end]) => ({
      'resident.age': { $gte: start, $lte: end },
    })));
  }
},

  renter: (value, obj) => {
    obj['address.unit'] = value ? { $ne: '' } : '';
  },

  polygons: async (value, obj) => {
    const polygon = await Polygon.findById(value);
    obj['location'] = { $geoWithin: { $geometry: polygon.geometry } };
  },

  temp_shape: (value, obj) => {
    obj['location'] = { $geoWithin: { $geometry: value.geometry } };
  },

  voteHistory: (value, obj) => {
    const elemMatches = value.map(selection => {
      const [year, electionType] = String(selection).split(' ');
      return { $elemMatch: { year, voted: true, electionType } };
    });
    obj['resident.voteHistory'] = { $all: elemMatches };
  },

  // Did not vote in any of the selected elections (a missing record or voted:false both count)
  not_voteHistory: (value, obj) => {
    if (!obj['$nor']) obj['$nor'] = [];
    value.forEach(selection => {
      const [year, electionType] = String(selection).split(' ');
      obj['$nor'].push({ 'resident.voteHistory': { $elemMatch: { year, voted: true, electionType } } });
    });
  },

  // Original registration date (regDates is stored oldest first), end date inclusive
  regDate: (value, obj, ctx) => {
    const [start, end] = value.map(toUTCDay);
    const range = {};
    if (start) range.$gte = start;
    if (end) range.$lt = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    if (!Object.keys(range).length) return;

    // Households hold an array of residents; $elemMatch makes one resident satisfy
    // both bounds instead of one resident matching $gte and another matching $lt
    if (ctx.groupBy === 'HOUSEHOLD') {
      obj['residents'] = { $elemMatch: { 'regDates.0': range } };
    } else {
      obj['resident.regDates.0'] = range;
    }
  },
  generalPropensity: (value, obj) => {
    addOrClause(obj, buildPropensityQuery('generalPropensity', value));
  },

  primaryPropensity: (value, obj) => {
    addOrClause(obj, buildPropensityQuery('primaryPropensity', value));
  },

  specialPropensity: (value, obj) => {
    addOrClause(obj, buildPropensityQuery('specialPropensity', value));
  },

  overallPropensity: (value, obj) => {
    const expression = {
    $size: {
      $filter: {
        input: { $ifNull: ['$resident.voteHistory', []] },
        as: 'vote',
        cond: {
          $and: [
            { $eq: ['$$vote.voted', true] },
            { $or: [
              { $eq: ['$$vote.electionType', 'General'] },
              { $eq: ['$$vote.electionType', 'Primary'] },
              { $eq: ['$$vote.electionType', 'Special'] },
            ]},
            { $not: [{ $in: ['$$vote.year', ['2018', '2016', '2020']] }] },
          ],
        },
      },
    },
  };

  const ranges = getVoteBounds(value);
  if (ranges) {
    obj['$expr'] = {
      $or: ranges.map((r) => ({
        $and: [
          { $gte: [expression, r.gte] },
          { $lt: [expression, r.lt] },
        ],
      })),
    };
  }
},

  progressive: (value, obj) => {
    obj['resident.progressive'] = value ? { $eq: value } : { $exists: false };
  },

  segment: (value, obj) => {
    obj['resident.segment'] = value ? { $in: value } : { $exists: false };
  },

  and_surveys: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    const elemMatch = value.map(v => ({ $elemMatch: { question: v.question, response: v.response } }));
    ctx.inclusionQuery['surveyResponse.questionResponses'] = { $all: elemMatch };
    ctx.inclusionQuery['surveyResponse.surveyID'] = { $in: value.map(v => v._id) };
  },

  or_surveys: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    const orArray = value.map(v => ({
      'surveyResponse.questionResponses': { $elemMatch: { question: v.question, response: v.response } },
    }));
    ctx.inclusionQuery['$or'] = orArray;
    ctx.inclusionQuery['surveyResponse.surveyID'] = { $in: value.map(v => v._id) };
  },

  not_surveys: async (value, obj, ctx) => {
    const exclusionQuery = {
      orgID: ctx.orgScope,
      '$or': value.map(v => ({
        'surveyResponse.questionResponses': { $elemMatch: { question: v.question, response: v.response } },
      })),
      'surveyResponse.surveyID': { $in: value.map(v => v._id) },
    };
    const results = await activityContactRecord.find(exclusionQuery, 'person.resident.personID').lean();
    ctx.excludedPersonIDs.push(...extractPersonIDs(results));
  },

  or_survey_contacts: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    ctx.inclusionQuery['surveyResponse.surveyID'] = { $in: value };
  },

  and_survey_contacts: async (value, obj, ctx) => {
    const results = await activityContactRecord.aggregate([
      { $match: { orgID: ctx.orgScope, 'surveyResponse.surveyID': { $in: value } } },
      { $group: { _id: '$personID', surveyIDs: { $addToSet: '$surveyResponse.surveyID' } } },
      { $match: { surveyIDs: { $all: value } } },
      { $project: { _id: 1 } },
    ]);
    ctx.includedPersonIDs.push(...results.map(x => x._id));
    obj['resident.personID'] = { $in: ctx.includedPersonIDs };
  },

  // Leaves out anyone with a response to any of these surveys
  not_survey_contacts: async (value, obj, ctx) => {
    const results = await activityContactRecord
      .find({ orgID: ctx.orgScope, 'surveyResponse.surveyID': { $in: value } }, 'person.resident.personID')
      .lean();
    ctx.excludedPersonIDs.push(...extractPersonIDs(results));
  },

  all_survey_contacts: async (value, obj, ctx) => {
    if (value) {
      ctx.checkingContactRecords = true;
      ctx.inclusionQuery['surveyResponse.surveyID'] = { $exists: true };
    } else {
      const results = await activityContactRecord
        .find({ orgID: ctx.orgScope, 'surveyResponse.surveyID': { $exists: true } }, 'person.resident.personID')
        .lean();
      ctx.excludedPersonIDs.push(...extractPersonIDs(results));
    }
  },

  // Voters contacted by any of the selected team members
  contacted_by: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    ctx.inclusionQuery['userID'] = { $in: value };
  },

  recentContact: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    const earliestContactDate = Date.now() - value * 60 * 60 * 1000;
    ctx.inclusionQuery['creationDate'] = { $gte: new Date(earliestContactDate) };
  },

  text_sent: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    ctx.inclusionQuery['campaignID'] = ctx.campaignID;
    ctx.inclusionQuery['textbankContactDetails.textSuccessful'] = true;
  },

  date_contacted: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    ctx.inclusionQuery['campaignID'] = ctx.campaignID;
    const start = new Date(new Date(value[0]).getTime() + 7 * 60 * 60 * 1000);
    const end   = new Date(new Date(value[1]).getTime() + (24 + 7) * 60 * 60 * 1000);
    ctx.inclusionQuery['creationDate'] = { $gte: start, $lte: end };
  },

  or_nonResponseSets: (value, obj, ctx) => {
    ctx.checkingContactRecords = true;
    ctx.inclusionQuery['nonResponse.nonResponse'] = { $in: value.map(v => v.nonResponse) };
    ctx.inclusionQuery['nonResponse.nonResponseSetID'] = { $in: value.map(v => v._id) };
  },

  not_nonResponseSets: async (value, obj, ctx) => {
    const results = await activityContactRecord.find({
      orgID: ctx.orgScope,
      'nonResponse.nonResponse':      { $in: value.map(v => v.nonResponse) },
      'nonResponse.nonResponseSetID': { $in: value.map(v => v._id) },
    }).lean();
    ctx.excludedPersonIDs.push(...extractPersonIDs(results));
  },

  zips:   (value, obj) => { obj['address.zip']  = { $in: value }; },
  cities: (value, obj) => { obj['address.city'] = { $in: value }; },
  precincts: (value, obj) => { obj['registrationPrecinctID'] = { $in: value }; },
  phones: (value, obj) => {
    if (value) {
      obj['resident.phones']         = { $ne: [] };
      obj['resident.invalidnumber']  = { $ne: true };
    } else {
      obj['resident.phones'] = { $eq: [] };
    }
  },

  // Uploaded PDI ID list; replaces the base "has a pdiID" condition
  pdiIDs: (value, obj) => {
    const ids = (value || []).map(v => String(v).trim().toUpperCase()).filter(Boolean);
    if (ids.length) obj['resident.pdiID'] = { $in: ids };
  },

  pdi_number: (value, obj) => {
    obj['resident.pdi_number'] = value ? { $eq: value } : { $exists: false };
  },

  mvp_list:  (value, obj) => { obj['resident.mvp_list'] = { $ne: true }; },
  new_reg:   (value, obj) => { obj['newReg'] = value; },

  districts: async (value, obj) => {
    const boundary = await Districts.find({ 'properties.identifier': { $in: value } });
    const districtType = boundary[0].properties.districtType.toLowerCase();
    obj[`districts.${districtType}ID`] = { $in: value };
  },

  exclude_party: (value, obj) => {
    if (!obj['$nor']) obj['$nor'] = [];
    obj['$nor'].push({ 'resident.party': { $in: value } });
  },

  exclude_race: (value, obj) => {
    if (!obj['$nor']) obj['$nor'] = [];
    obj['$nor'].push({ 'resident.ethnicity': { $in: value } });
  },

  exclude_voted_current_cycle: (value, obj) => {
    if (value) obj['resident.voted_current_cycle'] = { $ne: true };
  },

  spanish_probable: (value, obj) => {
    obj['resident.spanish_probable'] = value ? { $eq: true } : { $eq: null };
  },

  likely_callable: (value, obj, ctx) => {
    if (value) {
      ctx.checkingContactRecords = true;
      ctx.inclusionQuery['surveyResponse'] = { $exists: true };
      ctx.inclusionQuery['activityType']   = 'Phonebank';
    }
  },

  
  special_campaign: (value, obj) => {
    const steyerMap = { 1: 'steyer1', 2: 'steyer2', 3: 'steyer3' };
    const clauses = value
      .filter(v => steyerMap[v])
      .map(v => ({ [`resident.${steyerMap[v]}`]: true }));
    addOrClause(obj, clauses);
  },

  // Consent tags in older saved groups mean the consent flags
  tags: (value, obj) => {
    const split = splitConsentTags(value);
    if (split.tags.length) obj['tags.label'] = { $all: split.tags };
    if (split.texting) Object.assign(obj, TEXTING_OPTIN);
    if (split.email) Object.assign(obj, EMAIL_OPTIN);
  },

  // The Tags filter: [{label, values}]. Members must have every listed tag; a row with values also needs
  // one of them ('' means the tag with no value), a row without values matches any value.
  tagValues: (value, obj) => {
    for (const criterion of Array.isArray(value) ? value : []) {
      const label = criterion && criterion.label;
      const values = Array.isArray(criterion && criterion.values) ? criterion.values : [];
      if (!label) continue;

      if (!obj['$and']) obj['$and'] = [];
      obj['$and'].push(values.length ? tagValueClause(label, values) : { 'tags.label': label });
    }
  },

  optinTexting: (value, obj) => {
    if (value) Object.assign(obj, TEXTING_OPTIN);
  },

  optinEmail: (value, obj) => {
    if (value) Object.assign(obj, EMAIL_OPTIN);
  },

  // Members each upload created
  uploads: (value, obj) => {
    obj['enrollment.source'] = 'Upload';
    obj['enrollment.sourceID'] = { $in: value.map(String) };
  },

  // Members added or opted in by any of the selected activities
  activities: (value, obj) => {
    obj['activityIDs'] = { $in: value };
  },

  ignoreDistrict: () => {}, // no-op

  // A missing isRegisteredVoter counts as not a voter
  voter: (value, obj) => {
      obj['isRegisteredVoter'] = value ? true : { $ne: true }
  },

};

const VOTE_BUCKETS = {
  NONE:   { gte: 0, lt: 1 }, // voted in 0 elections
  LOW:    { gte: 1, lt: 3 },
  MEDIUM: { gte: 3, lt: 5 },
  HIGH:   { gte: 5, lt: 7 },
};

function getVoteBounds(values) {
  const ranges = values
    .map((v) => VOTE_BUCKETS[v])
    .filter(Boolean);

  return ranges.length ? ranges : null;
}

// Rewrites 'resident.' keys to 'residents.' at any depth. Only plain objects and arrays
// are walked, so Date and ObjectId values survive (a JSON round-trip turned them into strings).
const renameResidentKeys = (value) => {
  if (Array.isArray(value)) return value.map(renameResidentKeys);
  if (value && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [
      key.startsWith('resident.') ? key.replace('resident.', 'residents.') : key,
      renameResidentKeys(v),
    ]));
  }
  return value;
};

// regDates are stored as UTC midnight; the picker sends local midnight, so keep only the calendar day
const toUTCDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date)) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const extractPersonIDs = (records) =>
  records.map(x => x.person.resident.personID);

function addOrClause(obj, clauses) {
  if (!obj['$and']) obj['$and'] = [];
  obj['$and'].push({ $or: clauses });
}

function buildPropensityQuery(field, values) {
  const map = {
    HIGH:   { $gte: 66 },
    MEDIUM: { $gte: 33, $lt: 66 },
    LOW:    { $lt: 33, $gt: 0 },
    NONE:   { $eq: 0 },
  };
  return values.filter(v => map[v]).map(v => ({ [`resident.${field}`]: map[v] }));
}

module.exports = {convertQueries}
