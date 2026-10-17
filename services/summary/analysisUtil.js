'use strict';

const DEFAULT_OPTIONS = {
  match: { activityType: 'Canvass' },
  asOfDate: new Date('2025-11-04T00:00:00.000Z'),
  lastThreeGeneralYears: ['2024', '2022', '2020'],
  surveyQuestions: {
    votedAlready: 'Have you already voted?',
    candidateAsk: 'Can we count on you to vote for Tom Steyer for Governor?',
    votingMethod: 'Voting Method?',
  },
};

function buildPipeline(options) {
  const { match, asOfDate, lastThreeGeneralYears, surveyQuestions } = options;

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
        age: {
          $ifNull: [
            '$person.resident.age',
            { $dateDiff: { startDate: '$person.resident.dob', endDate: asOfDate, unit: 'year' } },
          ],
        },
        ethnicity: { $toLower: { $ifNull: ['$person.resident.ethnicity', 'unknown'] } },
        gender: { $toLower: { $ifNull: ['$person.resident.gender', 'unknown'] } },
        county: { $toUpper: { $ifNull: ['$person.county', 'unknown'] } },
        generalsVotedCount: {
          $size: {
            $filter: {
              input: { $ifNull: ['$person.resident.voteHistory', []] },
              as: 'vh',
              cond: {
                $and: [
                  { $eq: ['$$vh.electionType', 'General'] },
                  { $in: ['$$vh.year', lastThreeGeneralYears] },
                  { $eq: ['$$vh.voted', true] },
                ],
              },
            },
          },
        },
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
        age: { $first: '$age' },
        ethnicity: { $first: '$ethnicity' },
        gender: { $first: '$gender' },
        county: { $first: '$county' },
        generalsVotedCount: { $first: '$generalsVotedCount' },
        // 1 if ANY attempt for this voter had a survey response
        hasSurveyResponse: { $max: { $cond: ['$hasSurveyResponse', 1, 0] } },
        surveyAnswers: { $first: '$surveyAnswers' },
        contactAttempts: { $sum: 1 },
      },
    },

    {
      $addFields: {
        ageBand: {
          $switch: {
            branches: [
              { case: { $lte: ['$age', 24] }, then: '18-24' },
              { case: { $lte: ['$age', 54] }, then: '25-54' },
            ],
            default: '55+',
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
        voteHistoryDistribution: [{ $group: { _id: '$generalsVotedCount', count: { $sum: 1 } } }],

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
  const maxGenerals = options.lastThreeGeneralYears.length;
  const voteHistoryDistributionPct = {};
  for (let k = 0; k <= maxGenerals; k++) {
    voteHistoryDistributionPct[String(k)] = voteHistoryRaw[String(k)] || 0;
  }

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
      generalElectionsConsidered: options.lastThreeGeneralYears,
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