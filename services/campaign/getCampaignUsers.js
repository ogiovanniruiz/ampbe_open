var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')
var mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const getCampaignUsers = async(data) => {
    try {
        const agg = [
            {
                '$match': {
                    'campaignIDs': data.campaignID.toString(),
                    '_id': new ObjectId(data.orgID)
                }
            }, {
                '$project': {
                    'userIDs': 1
                }
            }
        ];

        var userList = await Organization.aggregate(agg);

        return await User.find({ _id: {$in: userList[0].userIDs}});

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignUsers}
