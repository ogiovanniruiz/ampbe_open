var Districts = require('../../models/campaigns/districts')

const identifyDistricts = async(location) => {
    try { 
        return await Districts.find({geometry: {$geoIntersects: {$geometry: location}}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {identifyDistricts}