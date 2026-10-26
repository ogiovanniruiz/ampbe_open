var Incident = require('../../models/hotline/incident');

const getIncidents = async(detail) => {
    try { 

        return Incident.find({orgID: detail.orgID})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getIncidents}