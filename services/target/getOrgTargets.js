var Target = require('../../models/targets/target')
const getOrgTargets = async(detail) => {
    try { 

        return await Target.find({'properties.campaignID': detail.campaignID, 'properties.orgID': detail.orgID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getOrgTargets}
