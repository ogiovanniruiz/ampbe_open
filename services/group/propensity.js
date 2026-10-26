'use strict';

// Shared by the group filters (convertQueries) and the Demographics summary (analysisUtil)
// so both count age and vote history the same way.

// "Overall Propensity" counts votes in these elections. Update when a new election is loaded.
const LAST_SIX_ELECTIONS = [
  { year: '2026', electionType: 'Primary' },
  { year: '2025', electionType: 'Special' },
  { year: '2024', electionType: 'General' },
  { year: '2024', electionType: 'Primary' },
  { year: '2022', electionType: 'General' },
  { year: '2022', electionType: 'Primary' },
];

// Votes out of LAST_SIX_ELECTIONS: lower bound inclusive, upper exclusive
const VOTE_BUCKETS = {
  NONE:   { gte: 0, lt: 1 },
  LOW:    { gte: 1, lt: 3 },
  MEDIUM: { gte: 3, lt: 5 },
  HIGH:   { gte: 5, lt: 7 },
};

// Age filter options, inclusive
const AGE_RANGES = {
  youth:   [18, 35],
  middle:  [36, 66],
  retired: [67, 120],
};

// Aggregation expression: how many of LAST_SIX_ELECTIONS the voteHistory array at `path` voted in
function votesInLastSix(path) {
  return {
    $size: {
      $filter: {
        input: { $ifNull: [path, []] },
        as: 'vote',
        cond: {
          $and: [
            { $eq: ['$$vote.voted', true] },
            { $or: LAST_SIX_ELECTIONS.map(e => ({
              $and: [
                { $eq: ['$$vote.year', e.year] },
                { $eq: ['$$vote.electionType', e.electionType] },
              ],
            })) },
          ],
        },
      },
    },
  };
}

module.exports = { LAST_SIX_ELECTIONS, VOTE_BUCKETS, AGE_RANGES, votesInLastSix };
