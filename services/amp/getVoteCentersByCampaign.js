const VoteCenter = require('../../models/campaigns/voteCenter')
const Districts = require('../../models/campaigns/districts')
const Campaign = require('../../models/campaigns/campaign')

// Every voting site inside the campaign boundary, for the campaign map layers. Sites at the same
// point are merged into one result whose `properties` lists each site, vote centers first, the same
// shape getNearestVoteCenters returns.
const getVoteCentersByCampaign = async (detail) => {
  const campaign = await Campaign.findOne({campaignID: detail.campaignID})
  if (!campaign) return []

  const boundaries = await Districts.find({'properties.identifier': {$in: campaign.boundaryIDs}})

  // A site near where two boundaries meet can be inside both; keep it once
  const sites = new Map()
  for (const boundary of boundaries) {
    const found = await VoteCenter.find({geometry: {$geoWithin: {$geometry: boundary.geometry}}}).lean()
    found.forEach(site => sites.set(String(site._id), site))
  }

  const places = new Map()
  for (const site of sites.values()) {
    const key = site.geometry.coordinates.join(',')
    if (!places.has(key)) places.set(key, {geometry: site.geometry, properties: []})
    places.get(key).properties.push(site.properties)
  }

  return [...places.values()].map(place => ({
    geometry: place.geometry,
    properties: place.properties.sort((a, b) => Number(b.Kind === 'vote_center') - Number(a.Kind === 'vote_center')),
  }))
}

module.exports = { getVoteCentersByCampaign }
