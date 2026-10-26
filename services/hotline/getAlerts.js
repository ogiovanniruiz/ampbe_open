var Alert = require('../../models/hotline/alert');

const getAlerts = async(detail) => {
    try { 
        return Alert.find({orgID: detail.orgID, incidentID: {$in: detail.activeIncidentIDs}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAlerts}