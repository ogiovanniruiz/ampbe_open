var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const archiveNonResponseSet = async(set) => {
    try { 

        var nonResponseSet  = await NonResponseSet.findOne({_id: set._id})

        if(nonResponseSet.orgStatus.active){
            nonResponseSet.orgStatus.active = false
            return nonResponseSet.save()
        }

        nonResponseSet.orgStatus.active = true
        return nonResponseSet.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {archiveNonResponseSet}