var ActivityHouseholdRecord = require('../../models/activities/activityHouseholdRecord')
var Activity = require('../../models/activities/activity')
var Group = require('../../models/groups/group')
var Polygon = require('../../models/shapes/polygon')


const getActivitySize = async(detail) => {
    try { 

        agg = [
            {$match: {activityID: detail.activityID}},
            { $project: { numResidents: { $size: "$household.residents" } } },
            { $group: {
                _id: null,
                totalHHs: { $sum: 1 },
                totalResidents: { $sum: "$numResidents" }
              } }
        ]

        var estimateResults = await ActivityHouseholdRecord.aggregate(agg).allowDiskUse(true).limit(500000)

        var activity = await Activity.findOne({_id: detail.activityID})

        if(!activity){
            return {totalHouseHolds: 0, totalResidents: 0, density: 0}
        }

        var density = 0

        if(activity.activityType === "Canvass"){
            var group = await Group.findOne({_id: activity.groupID})
            var polygonID = group.queries.polygons[0]
            var polygon = await Polygon.findOne({_id: polygonID})

            if(estimateResults[0]){
                density = Math.ceil(estimateResults[0].totalHHs / getFeatureAreaMiles(polygon))
            }

        }

        if(estimateResults[0]){
            return {totalHouseHolds: estimateResults[0].totalHHs, totalResidents: estimateResults[0].totalResidents, density: density}
        }

        return {totalHouseHolds: 0, totalResidents: 0, density: 0}
       

    } catch(e){
        throw new Error(e.message)
    }
}

function getFeatureAreaMiles(feature) {
    const turf = require("@turf/turf");
    const SQ_METERS_TO_SQ_MILES = 3.861021585424458e-7;

  if (!feature || !feature.geometry) {
    throw new Error("Invalid GeoJSON feature");
  }

  const squareMeters = turf.area(feature);
  return squareMeters * SQ_METERS_TO_SQ_MILES;
}


module.exports = {getActivitySize}