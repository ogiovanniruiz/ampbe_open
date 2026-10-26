var Groups = require('../../models/groups/group')

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const editGroup = async(details) => {
    try {
        var name = (details.newGroupName || '').trim().replace(/\s+/g, ' ')
        if(!name) return {success: false, msg: "The group needs a name."}

        var foundGroup = await Groups.findOne({_id: details.group?._id})
        if(!foundGroup) return {success: false, msg: "This group no longer exists."}

        // Another group in this campaign with the same name (case-insensitive)
        var duplicate = await Groups.findOne({
            _id: {$ne: foundGroup._id},
            campaignID: foundGroup.campaignID,
            name: {$regex: `^${escapeRegex(name)}$`, $options: 'i'}
        }, {_id: 1})
        if(duplicate) return {success: false, msg: `A group named "${name}" already exists in this campaign.`}

        foundGroup.name = name
        foundGroup.campaignWide = !!details.campaignWide
        await foundGroup.save()

        return {success: true, group: foundGroup, msg: "Saved."}
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editGroup}
