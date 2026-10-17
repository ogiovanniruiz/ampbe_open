var ActivityContactRecord = require('../../models/activities/activityContactRecord')

// Repeat texts to a number are appended to one conversation, so count the messages sent, not the records
const getSingularTextingReport = async(match) => {
    return await ActivityContactRecord.aggregate([
        {$match: {...match, activityType: 'Texting'}},
        {'$project': {
            'userID': 1,
            'sent': {'$size': {'$filter': {
                'input': {'$ifNull': ['$textbankContactDetails.textConvo', []]},
                'as': 'c',
                'cond': {'$eq': ['$$c.origin', 'USER']}
            }}}
        }},
        {
            $group: {
                _id: "$userID",
                textSent: {'$sum': '$sent'}
            }
        }
    ])
}

module.exports = {getSingularTextingReport}
