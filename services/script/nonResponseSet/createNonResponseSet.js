var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const createNonResponseSet = async(newNonResponseSet) => {
    try { 

        var nonResponseSet = await NonResponseSet.findOne({title: newNonResponseSet.title, campaignIDs: newNonResponseSet.campaignIDs})

        if(nonResponseSet){
            return {success: false, msg: "A Script with this name already exists."}
        }
       
        var createdNonResponseSet = new NonResponseSet(newNonResponseSet)
        createdNonResponseSet.save()
        return {success: true, createdNonResponseSet: createdNonResponseSet, msg: "Success."}
        
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {createNonResponseSet}