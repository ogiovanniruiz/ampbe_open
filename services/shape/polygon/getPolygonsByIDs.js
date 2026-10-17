var Activity = require('../../../models/activities/activity')
var Group = require('../../../models/groups/group')

const getPolygonsByIDs = async(detail) => {
    try {
        var canvasses = await Activity.find(detail).sort({ name: 1 });

        if(canvasses.length == 0) return []

        var groupIDs = canvasses.map(x=> {return x.groupID})
        var groups = await Group.find({_id: {$in: groupIDs}})

        return groups.map(x => {return x.queries.polygons?.[0]})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPolygonsByIDs}