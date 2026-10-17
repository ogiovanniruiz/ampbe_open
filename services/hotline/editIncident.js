var Incident = require('../../models/hotline/incident');

const editIncident = async(newIncident) => {
    try { 

        var oldIncident = await Incident.findOne({_id: newIncident._id})

        oldIncident.categories = newIncident.categories
        oldIncident.status = newIncident.status
        oldIncident.severity = newIncident.severity

        oldIncident.reports = newIncident.reports
        oldIncident.active = newIncident.active

        return await oldIncident.save()

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editIncident}