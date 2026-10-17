var Groups = require('../../../models/groups/group')
var Activity = require('../../../models/activities/activity')

/**
 * Groups and activities in a campaign that use each polygon, in two queries.
 * Returns {[polygonID]: {groups: [{_id, name}], activities: [activity]}}
 */
const getPolygonsUsage = async(detail) => {
    try {
        var polygonIDs = (detail.polygonIDs || []).map(String)
        var usage = {}
        polygonIDs.forEach(id => usage[id] = {groups: [], activities: []})
        if(!polygonIDs.length) return usage

        var groups = await Groups.find(
            {'queries.polygons': {$in: polygonIDs}, campaignID: detail.campaignID},
            {name: 1, 'queries.polygons': 1}
        ).lean()
        if(!groups.length) return usage

        var activities = await Activity.find({campaignID: detail.campaignID, groupID: {$in: groups.map(g => String(g._id))}}).sort({name: 1}).lean()
        var activitiesByGroup = new Map()
        activities.forEach(activity => {
            if(!activitiesByGroup.has(activity.groupID)) activitiesByGroup.set(activity.groupID, [])
            activitiesByGroup.get(activity.groupID).push(activity)
        })

        groups.forEach(group => {
            var groupActivities = activitiesByGroup.get(String(group._id)) || []
            ;(group.queries?.polygons || []).map(String).forEach(polygonID => {
                if(!usage[polygonID]) return
                usage[polygonID].groups.push({_id: group._id, name: group.name})
                usage[polygonID].activities.push(...groupActivities)
            })
        })

        return usage
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPolygonsUsage}
