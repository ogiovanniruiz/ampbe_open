var COI = require('../../models/assets/coi')

const deleteCOI = async(coiDetail) => {
    try { 
        return await COI.deleteOne({_id: coiDetail.coiID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteCOI}