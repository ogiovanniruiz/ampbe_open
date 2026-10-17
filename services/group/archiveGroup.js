var Group = require('../../models/groups/group.js')

// setActive makes the call idempotent; without it the group toggles (older callers)
const archiveGroup = async(detail) => {
    try { 
        var group = await Group.findOne({_id: detail._id})
        if(!group) return null

        group.active = typeof detail.setActive === 'boolean' ? detail.setActive : !group.active
        return group.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archiveGroup}
