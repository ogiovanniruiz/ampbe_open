const Districts = require('../../models/campaigns/districts')

const getFullDistricts = async(districtType) => {
    try {
        return await Districts.find({'properties.districtType': districtType.value})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getFullDistricts}