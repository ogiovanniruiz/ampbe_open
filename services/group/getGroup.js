var Group = require('../../models/groups/group')

const getGroup = async(detail) => {
    try { 

        return await Group.findOne({_id: detail._id})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getGroup}