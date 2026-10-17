var {findDuplicateGroups} = require('./memberUtils')

// Groups of members that look like the same person
const getDuplicateMembers = async(detail) => {
    try {
        return await findDuplicateGroups(detail.orgID)
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getDuplicateMembers}
