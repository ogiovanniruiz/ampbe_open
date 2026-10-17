var NonResponseSet = require('../../../models/surveys/nonResponseSet.js')

const createNonResponseSet = async(newNonResponseSet) => {
    try { 

        // $in: an array value would only match sets whose campaign list is exactly the same
        var nonResponseSet = await NonResponseSet.findOne({name: newNonResponseSet.name, campaignIDs: {$in: newNonResponseSet.campaignIDs || []}})

        if(nonResponseSet){
            return {success: false, msg: "A non-response set with this name already exists in this campaign."}
        }
       
        var createdNonResponseSet = new NonResponseSet(newNonResponseSet)
        await createdNonResponseSet.save()
        return {success: true, createdNonResponseSet: createdNonResponseSet, msg: "Success."}
        
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createNonResponseSet}