var Polygon = require('../../../models/shapes/polygon')
var Groups = require('../../../models/groups/group')
var Activity = require('../../../models/activities/activity')

const getPolygonUsage = async(detail) => {
    try {

        var groups = await Groups.find({"queries.polygons": detail.polygonID, campaignID: detail.campaignID})

        var activities = []

        for (let i = 0; i < groups.length; i++) {

            var foundActivities = await Activity.find({campaignID: detail.campaignID, groupID: groups[i]._id})
        
            activities = activities.concat(foundActivities)
        }
        
        return {groups, activities}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPolygonUsage}