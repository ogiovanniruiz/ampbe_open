var mongoose = require('mongoose');
var Incident = require('../../models/hotline/incident');

const deleteIncident = async(incident) => {
    try { 
        return Incident.deleteOne({_id: incident.incidentID})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteIncident}