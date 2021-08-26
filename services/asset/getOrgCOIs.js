var COI = require('../../models/assets/coi')

const getOrgCOIs = async(coiDetail) => {
    try { 
        return await COI.find({'properties.orgID': coiDetail.orgID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgCOIs}