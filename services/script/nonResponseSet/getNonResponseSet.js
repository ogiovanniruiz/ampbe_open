var NonResponseSet = require('../../../models/scripts/nonResponseSet.js')

const getNonResponseSet = async(nonResponseSet) => {
    try { 
        return await NonResponseSet.findById(nonResponseSet.nonResponseSetID);
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getNonResponseSet}