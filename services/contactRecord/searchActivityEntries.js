var ActivityContactRecord = require('../../models/activities/activityContactRecord')

const PAGE_SIZE = 50

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const contains = (text) => ({$regex: escapeRegex(text.trim()), $options: 'i'})

// Survey responses and nonresponses in one activity, filtered and paged for the edit entries dialog.
// Records with neither (open calls, text sends) have nothing to edit and aren't listed.
const searchActivityEntries = async(detail) => {
    try {
        var filters = detail.filters || {}
        var and = [
            {activityID: detail.activityID},
            {$or: [{surveyResponse: {$exists: true}}, {nonResponse: {$exists: true}}]},
        ]

        if(filters.voter && filters.voter.trim()){
            // "maria lopez" matches when every word is in the first, last or full name
            filters.voter.trim().split(/\s+/).forEach(word => and.push({$or: [
                {'person.resident.name.fullName': contains(word)},
                {'person.resident.name.firstName': contains(word)},
                {'person.resident.name.lastName': contains(word)},
            ]}))
        }

        if(Array.isArray(filters.userIDs) && filters.userIDs.length) and.push({userID: {$in: filters.userIDs.map(String)}})

        // Dates arrive already shifted to Pacific days, as in the activity reports
        if(filters.startDate || filters.endDate){
            var creationDate = {}
            if(filters.startDate) creationDate.$gte = new Date(filters.startDate)
            if(filters.endDate) creationDate.$lte = new Date(filters.endDate)
            and.push({creationDate})
        }

        if(filters.kind === 'survey') and.push({surveyResponse: {$exists: true}})
        if(filters.kind === 'nonresponse') and.push({nonResponse: {$exists: true}})

        if(filters.question){
            var elem = {question: filters.question}
            if(filters.answer) elem.response = filters.answer
            and.push({'surveyResponse.questionResponses': {$elemMatch: elem}})
        }

        if(filters.nonResponse) and.push({'nonResponse.nonResponse': filters.nonResponse})

        if(filters.phone){
            var digits = String(filters.phone).replace(/\D/g, '')
            if(digits) and.push({'person.resident.phones.number': {$regex: escapeRegex(digits)}})
        }

        if(filters.address && filters.address.trim()){
            filters.address.trim().split(/\s+/).forEach(word => and.push({$or: [
                {'person.fullAddress1': contains(word)},
                {'person.address.streetNum': contains(word)},
                {'person.address.street': contains(word)},
                {'person.address.city': contains(word)},
                {'person.address.zip': contains(word)},
            ]}))
        }

        if(filters.pass !== undefined && filters.pass !== null && filters.pass !== '') and.push({pass: Number(filters.pass)})

        if(filters.edited) and.push({'editHistory.0': {$exists: true}})

        if(filters.notes && filters.notes.trim()){
            and.push({'surveyResponse.questionResponses': {$elemMatch: {questionType: 'NOTES', response: contains(filters.notes)}}})
        }

        var match = {$and: and}
        var page = Math.max(0, parseInt(detail.page) || 0)

        var [total, rows] = await Promise.all([
            ActivityContactRecord.countDocuments(match),
            ActivityContactRecord.find(match, {
                creationDate: 1, pass: 1, complete: 1, activityType: 1, userID: 1, 'user.name.fullName': 1,
                'person.resident.personID': 1, 'person.resident.name': 1, 'person.resident.phones': 1,
                'person.fullAddress1': 1, 'person.address': 1,
                surveyResponse: 1, nonResponse: 1, editHistory: 1,
            }).sort({creationDate: -1, _id: -1}).skip(page * PAGE_SIZE).limit(PAGE_SIZE).lean(),
        ])

        var result = {total, rows, pageSize: PAGE_SIZE}

        // Volunteers with entries in the activity, for the volunteer filter
        if(detail.includeUsers){
            result.users = (await ActivityContactRecord.aggregate([
                {$match: {activityID: detail.activityID, $or: [{surveyResponse: {$exists: true}}, {nonResponse: {$exists: true}}]}},
                {$group: {_id: '$userID', name: {$first: '$user.name.fullName'}, count: {$sum: 1}}},
                {$sort: {name: 1}},
            ])).filter(user => user._id).map(user => ({_id: user._id, name: user.name || 'Unknown volunteer', count: user.count}))
        }

        return result
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {searchActivityEntries}
