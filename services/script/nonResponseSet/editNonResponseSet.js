var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const editNonResponseSet = async(data) => {
    try { 
        var nonResponseSet = await NonResponseSet.findOne({_id: data.nonResponseSetID})

        if(nonResponseSet.title != data.nonResponseSet.title){
            var duplicateNonResponseSet = await NonResponseSet.findOne({title: data.nonResponseSet.title, campaignIDs: data.campaignID})
            if(duplicateNonResponseSet){
                return {success: false, msg: "NonResponseSet with that title already exists."}
            }

            nonResponseSet.title = data.nonResponseSet.title
        }
        nonResponseSet.campaignIDs = data.nonResponseSet.campaignIDs
        nonResponseSet.nonResponses = data.nonResponseSet.nonResponses
        nonResponseSet.save()

        return {success: true, nonResponseSet: nonResponseSet, msg: "Success."}

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editNonResponseSet}