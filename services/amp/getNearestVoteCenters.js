const VoteCenter = require('../../models/campaigns/voteCenter')

const METERS_PER_MILE = 1609.34;
const EARTH_RADIUS_METERS = 6378100;

const MAX_VOTE_CENTERS = 2;
const MAX_DROPOFFS = 1;

// Nearest points within `miles`, closest first: up to MAX_VOTE_CENTERS places with a vote center
// and MAX_DROPOFFS with a ballot drop-off, so one kind never crowds out the other. Sites at the
// same point (a vote center and a drop-off at the same address are stored at one point) are
// merged into one result whose `properties` lists each site, vote centers first.
const buildPipeline = (coords, miles, county) => [
  {
    $match: {
      geometry: {
        $geoWithin: {
          $centerSphere: [coords, (miles * METERS_PER_MILE) / EARTH_RADIUS_METERS],
        },
      },
    },
  },

  // Vote centers and drop boxes are run by each county and serve that county's voters
  ...(county ? [{ $match: { "properties.County": county.toUpperCase() } }] : []),

  {
    $group: {
      _id: "$geometry.coordinates",
      properties: { $push: "$properties" },
      geometry: { $first: "$geometry" },
    },
  },

  {
    $addFields: {
      distance: {
        $let: {
          vars: {
            lat1: { $degreesToRadians: coords[1] },
            lon1: { $degreesToRadians: coords[0] },
            lat2: { $degreesToRadians: { $arrayElemAt: ["$geometry.coordinates", 1] } },
            lon2: { $degreesToRadians: { $arrayElemAt: ["$geometry.coordinates", 0] } },
          },
          in: {
            $multiply: [
              EARTH_RADIUS_METERS,
              {
                $acos: {
                  // Rounding can push identical points just past 1, which $acos turns into NaN
                  $min: [1, { $max: [-1, {
                    $add: [
                      { $multiply: [{ $sin: "$$lat1" }, { $sin: "$$lat2" }] },
                      {
                        $multiply: [
                          { $cos: "$$lat1" },
                          { $cos: "$$lat2" },
                          { $cos: { $subtract: ["$$lon2", "$$lon1"] } },
                        ],
                      },
                    ],
                  }] }],
                },
              },
            ],
          },
        },
      },
    },
  },

  { $sort: { distance: 1 } },

  {
    $facet: {
      voteCenters: [{ $match: { "properties.Kind": "vote_center" } }, { $limit: MAX_VOTE_CENTERS }],
      // Any drop-off site at the place, including one that is also a vote center
      dropoffs: [{ $match: { properties: { $elemMatch: { Kind: { $ne: "vote_center" } } } } }, { $limit: MAX_DROPOFFS }],
    },
  },

  // A place with both kinds can be in both lists; keep it once
  { $project: { places: { $concatArrays: ["$voteCenters", "$dropoffs"] } } },
  { $unwind: "$places" },
  { $replaceRoot: { newRoot: "$places" } },
  { $group: { _id: "$_id", doc: { $first: "$$ROOT" } } },
  { $replaceRoot: { newRoot: "$doc" } },
  { $sort: { distance: 1 } },

  {
    $set: {
      properties: {
        $sortArray: { input: "$properties", sortBy: { Kind: -1 } },
      },
    },
  },

  {
    $project: {
      _id: 0,
      geometry: 1,
      properties: 1,
      distanceMiles: { $round: [{ $divide: ["$distance", METERS_PER_MILE] }, 1] },
    },
  },
];

// One wide search: each kind is capped separately, so a nearby drop-off can't hide a vote
// center that is a little farther out
const SEARCH_MILES = 20;

// `body` is {location, county}; county is optional (older clients only send the location)
const getNearestVoteCenters = async (body) => {
  const coords = (body.location || body).coordinates;
  return VoteCenter.aggregate(buildPipeline(coords, SEARCH_MILES, body.county));
};

module.exports = { getNearestVoteCenters };
