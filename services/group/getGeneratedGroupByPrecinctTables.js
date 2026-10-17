const GroupByPrecinct = require('../../models/groups/groupbyprecinct');

const Groups = require('../../models/groups/group')

const getGeneratedGroupByPrecinctTables = async (data) => {

    let groups = await Groups.find({campaignID: data.campaignID, campaignWide: true, active: true})

    let groupIDs = groups.map(group => group._id.toString())

    return await GroupByPrecinct.distinct('groupID', { groupID: { $in: groupIDs } });

}

module.exports = { getGeneratedGroupByPrecinctTables };


