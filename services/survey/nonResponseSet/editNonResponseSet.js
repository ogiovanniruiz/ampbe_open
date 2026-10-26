var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')
var { getNonResponseSetUsage } = require('./getNonResponseSetUsage')

const contacts = (n) => n === 1 ? '1 contact' : `${n.toLocaleString()} contacts`

/**
 * Responses already recorded on contacts can't be renamed, retyped or removed:
 * summaries, group filters and DNC / invalid rules read the stored text and type.
 * Returns an error message, or null when allowed.
 */
const lockedChangeError = (originalResponses, newResponses, usage) => {
    for(const original of originalResponses){
        const count = usage.responses[original.nonResponse] || 0
        if(!count) continue

        const updated = newResponses.find(nr => nr.nonResponse === original.nonResponse)
        if(!updated){
            return `Can't change or remove "${original.nonResponse}": it's recorded on ${contacts(count)}. Add a new response instead.`
        }
        if(updated.nonResponseType !== original.nonResponseType){
            return `Can't change the type of "${original.nonResponse}": it's recorded on ${contacts(count)}.`
        }
    }
    return null
}

const editNonResponseSet = async(data) => {
    try { 
        var nonResponseSet = await NonResponseSet.findOne({_id: data.nonResponseSetID})
        if(!nonResponseSet) return {success: false, msg: "This non-response set no longer exists."}

        var usage = await getNonResponseSetUsage({nonResponseSetID: data.nonResponseSetID})
        var lockError = lockedChangeError(nonResponseSet.nonResponses || [], data.nonResponseSet.nonResponses || [], usage)
        if(lockError) return {success: false, msg: lockError}

        if(nonResponseSet.name != data.nonResponseSet.name){
            var duplicateNonResponseSet = await NonResponseSet.findOne({name: data.nonResponseSet.name, campaignIDs: data.campaignID})
            if(duplicateNonResponseSet){
                return {success: false, msg: "NonResponseSet with that name already exists."}
            }

            nonResponseSet.name = data.nonResponseSet.name
        }
        nonResponseSet.campaignIDs = data.nonResponseSet.campaignIDs
        nonResponseSet.nonResponses = data.nonResponseSet.nonResponses
        await nonResponseSet.save()

        return {success: true, nonResponseSet: nonResponseSet, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editNonResponseSet, lockedChangeError}