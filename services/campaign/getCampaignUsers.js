var Organization = require('../../models/organizations/organization')
var User = require('../../models/users/user')
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getCampaignUsers = async(data) => {
    try {
        const agg = [
            {
                '$match': {
                    'campaignIDs': data.campaignID.toString(),
                    '_id': ObjectId(data.orgID)
                }
            }, {
                '$project': {
                    'userIDs': 1
                }
            }/*, {
                '$group': {
                    '_id': null,
                    'userIDs': {
                        '$push': '$userIDs'
                    }
                }
            }, {
                '$addFields': {
                    'userIDs': {
                        '$reduce': {
                            'input': '$userIDs',
                            'initialValue': [],
                            'in': {
                                '$concatArrays': [
                                    '$$value', '$$this'
                                ]
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'userIDs': {
                        '$setUnion': [
                            '$userIDs', []
                        ]
                    }
                }
            }*/
        ];

        var userList = await Organization.aggregate(agg);
        var users = await User.find({ _id: {$in: userList[0].userIDs}});

        return users
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCampaignUsers}
