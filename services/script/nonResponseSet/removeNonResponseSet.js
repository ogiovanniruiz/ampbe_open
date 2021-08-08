var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const removeNonResponseSet = async(nonResponseSet) => {
    try { 
        return await NonResponseSet.deleteOne({_id: nonResponseSet._id});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {removeNonResponseSet}