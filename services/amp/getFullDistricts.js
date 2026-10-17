const Districts = require('../../models/campaigns/districts')

const getFullDistricts = async(districtType) => {
    try {
        return await Districts.find({'properties.identifier': {$in: districtType.ids}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getFullDistricts}