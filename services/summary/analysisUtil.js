'use strict';

const People = require('../../models/people/people');
const { LAST_SIX_ELECTIONS, VOTE_BUCKETS, AGE_RANGES, votesInLastSix } = require('../group/propensity');

const DEFAULT_OPTIONS = {
  match: { activityType: 'Canvass' },
  surveyQuestions: {
    votedAlready: 'Have you already voted?',
    candidateAsk: 'Can we count on you to vote for Tom Steyer for Governor?',
    votingMethod: 'Voting Method?',
  },
};

function buildPipeline(options) {
  const { match, surveyQuestions } = options;

  return [
    ...(match ? [{ $match: match }] : []),

    // 1. Flatten survey responses into a lookup object
    {
      $addFields: {
        surveyAnswers: {
          $arrayToObject: {
            $map: {
              input: { $ifNull: ['$surveyResponse.questionResponses', []] },
              as: 'qr',
              in: { k: '$$qr.question', v: '$$qr.response' },
            },
          },
        },
      },
    },

    // 2. Per-contact-record derived fields
    {
      $addFields: {
        ampID: '$person.resident.ampID',
        ethnicity: { $toLower: { $ifNull: ['$person.resident.ethnicity', 'unknown'] } },
        gender: { $toLower: { $ifNull: ['$person.resident.gender', 'unknown'] } },
        county: { $toUpper: { $ifNull: ['$person.county', 'unknown'] } },
        // Same count as the Overall Propensity group filter
        votesInLastSix: votesInLastSix('$person.resident.voteHistory'),
        // Whether this record has ANY survey answer
        hasSurveyResponse: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $objectToArray: '$surveyAnswers' },
                  as: 'a',
                  cond: { $and: [{ $ne: ['$$a.v', null] }, { $ne: ['$$a.v', ''] }] },
                },
              },
            },
            0,
          ],
        },
      },
    },

    // 3. Sort so records WITH survey answers are preferred when deduping
    { $sort: { hasSurveyResponse: -1, complete: -1 } },

    // 4. Dedupe to one row per unique voter — ALL voters regardless of survey
    {
      $group: {
        _id: '$ampID',
        personID: { $first: '$personID' },
        dob: { $first: '$person.resident.dob' },
        ethnicity: { $first: '$ethnicity' },
        gender: { $first: '$gender' },
        county: { $first: '$county' },
        votesInLastSix: { $first: '$votesInLastSix' },
        // 1 if ANY attempt for this voter had a survey response
        hasSurveyResponse: { $max: { $cond: ['$hasSurveyResponse', 1, 0] } },
        surveyAnswers: { $first: '$surveyAnswers' },
        contactAttempts: { $sum: 1 },
      },
    },

    // Contact-record snapshots don't keep age, so read it from the voter file (-1 = unknown).
    // People no longer in the voter file fall back to the snapshot's dob, aged to today.
    {
      $lookup: {
        from: People.collection.name,
        let: { personID: '$personID' },
        pipeline: [
          { $match: { $expr: { $eq: ['$resident.personID', '$$personID'] } } },
          { $project: { _id: 0, age: '$resident.age' } },
          { $limit: 1 },
        ],
        as: 'voterFile',
      },
    },
    {
      $addFields: {
        age: {
          $let: {
            vars: {
              age: {
                $ifNull: [
                  { $first: '$voterFile.age' },
                  // Whole years lived (unit 'year' would count calendar-year boundaries)
                  { $floor: { $divide: [{ $dateDiff: { startDate: '$dob', endDate: '$$NOW', unit: 'day' } }, 365.25] } },
                ],
              },
            },
            in: { $cond: [{ $gte: ['$$age', AGE_RANGES.youth[0]] }, '$$age', null] },
          },
        },
      },
    },

    // Bands match the Age and Overall Propensity group filters
    {
      $addFields: {
        ageBand: {
          $switch: {
            branches: [
              { case: { $eq: ['$age', null] }, then: 'unknown' },
              ...Object.values(AGE_RANGES).map(([start, end]) => ({
                case: { $lte: ['$age', end] },
                then: end >= 120 ? `${start}+` : `${start}-${end}`,
              })),
            ],
            default: 'unknown',
          },
        },
        voteBand: {
          $switch: {
            branches: Object.entries(VOTE_BUCKETS).map(([band, { lt }]) => ({
              case: { $lt: ['$votesInLastSix', lt] },
              then: band.toLowerCase(),
            })),
            default: 'high',
          },
        },
      },
    },

    // 5. Fan out into every distribution at once
    {
      $facet: {
        // Total deduplicated voters (everyone)
        universeSizeAll: [{ $count: 'n' }],

        // Total deduplicated voters WITH a survey response
universeSizeSurveyed: [
  { $match: { hasSurveyResponse: { $eq: 1 } } },
  { $count: 'n' },
],

        ageStats: [{ $group: { _id: null, averageAge: { $avg: '$age' } } }],
        ageDistribution: [{ $group: { _id: '$ageBand', count: { $sum: 1 } } }],
        genderDistribution: [{ $group: { _id: '$gender', count: { $sum: 1 } } }],
        ethnicityDistribution: [{ $group: { _id: '$ethnicity', count: { $sum: 1 } } }],
        countyDistribution: [{ $group: { _id: '$county', count: { $sum: 1 } } }],
        voteHistoryDistribution: [{ $group: { _id: '$voteBand', count: { $sum: 1 } } }],

        surveyQuestionStats: [
          // Only voters who had at least one survey answer
          { $match: { hasSurveyResponse: 1 } },
          {
            $project: {
              votedAlready: `$surveyAnswers.${surveyQuestions.votedAlready}`,
              candidateAsk: `$surveyAnswers.${surveyQuestions.candidateAsk}`,
              votingMethod: `$surveyAnswers.${surveyQuestions.votingMethod}`,
            },
          },
          {
            $group: {
              _id: null,
              votedAlready_yes: { $sum: { $cond: [{ $eq: ['$votedAlready', 'Yes'] }, 1, 0] } },
              votedAlready_answered: { $sum: { $cond: [{ $ifNull: ['$votedAlready', false] }, 1, 0] } },
              candidateAsk_yes: { $sum: { $cond: [{ $eq: ['$candidateAsk', 'Yes'] }, 1, 0] } },
              candidateAsk_answered: { $sum: { $cond: [{ $ifNull: ['$candidateAsk', false] }, 1, 0] } },
              votingMethod_answered: { $sum: { $cond: [{ $ifNull: ['$votingMethod', false] }, 1, 0] } },
            },
          },
        ],
      },
    },
  ];
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function pctFromBuckets(buckets, total) {
  const out = {};
  (buckets || []).forEach((b) => {
    out[String(b._id)] = total ? round1((b.count / total) * 100) : 0;
  });
  return out;
}

function shapeResult(facetDoc, options) {
  const universeSizeAll = facetDoc.universeSizeAll[0]?.n || 0;
  const universeSizeSurveyed = facetDoc.universeSizeSurveyed[0]?.n || 0;
  const averageAge = facetDoc.ageStats[0] ? round1(facetDoc.ageStats[0].averageAge) : null;

  const ethnicityDistributionPct = pctFromBuckets(facetDoc.ethnicityDistribution, universeSizeAll);
  const pctVotersOfColor = round1(100 - (ethnicityDistributionPct.white || 0));
  const pctHispanic = ethnicityDistributionPct.hispanic || 0;

  const voteHistoryRaw = pctFromBuckets(facetDoc.voteHistoryDistribution, universeSizeAll);
  const voteHistoryDistributionPct = {};
  Object.keys(VOTE_BUCKETS).forEach((band) => {
    const key = band.toLowerCase();
    voteHistoryDistributionPct[key] = voteHistoryRaw[key] || 0;
  });

  const sq = facetDoc.surveyQuestionStats[0] || {};
  const rate = (yes, answered) => (answered ? round1((yes / answered) * 100) : null);

  return {
    // Two universe totals
    universeSizeAll,
    universeSizeSurveyed,

    averageAge,
    ageDistributionPct: pctFromBuckets(facetDoc.ageDistribution, universeSizeAll),
    genderDistributionPct: pctFromBuckets(facetDoc.genderDistribution, universeSizeAll),
    ethnicityDistributionPct,
    pctVotersOfColor,
    pctHispanic,
    countyDistributionPct: pctFromBuckets(facetDoc.countyDistribution, universeSizeAll),
    voteHistory: {
      electionsConsidered: LAST_SIX_ELECTIONS.map(e => `${e.year} ${e.electionType}`),
      distributionPct: voteHistoryDistributionPct,
    },
    surveyResults: {
      [options.surveyQuestions.votedAlready]: {
        nAnswered: sq.votedAlready_answered || 0,
        yesRatePct: rate(sq.votedAlready_yes, sq.votedAlready_answered),
      },
      [options.surveyQuestions.candidateAsk]: {
        nAnswered: sq.candidateAsk_answered || 0,
        yesRatePct: rate(sq.candidateAsk_yes, sq.candidateAsk_answered),
      },
      [options.surveyQuestions.votingMethod]: {
        nAnswered: sq.votingMethod_answered || 0,
      },
    },
  };
}

async function analyzeUniverseMongo(Model, overrides = {}) {
  const options = { ...DEFAULT_OPTIONS, ...overrides };
  const pipeline = buildPipeline(options);
  const results = await Model.aggregate(pipeline);
  const facetDoc = Array.isArray(results) ? results[0] : results;
  return shapeResult(facetDoc, options);
}

module.exports = { analyzeUniverseMongo, buildPipeline, shapeResult, DEFAULT_OPTIONS };