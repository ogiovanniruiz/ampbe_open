var COI = require('../../models/assets/coi')

const getCOI = async(detail) => {
    try {
        return await COI.findOne({"_id": detail.coiID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCOI}
