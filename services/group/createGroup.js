var Group = require('../../models/groups/group')
const createGroup = async(groupProperties) => {
    try {
        
        var group = await Group.findOne({name: groupProperties.name, campaignID: groupProperties.campaignID})

        if(group){
            return false
        }

        var newCreatedGroup  = new Group(groupProperties)
        return newCreatedGroup.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createGroup}