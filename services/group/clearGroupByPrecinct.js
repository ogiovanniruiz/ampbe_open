const GroupByPrecinct = require('../../models/groups/groupbyprecinct');

const clearGroupByPrecinct = async (group) => {
    return await GroupByPrecinct.deleteMany({ groupID: group._id });
}

module.exports = { clearGroupByPrecinct };