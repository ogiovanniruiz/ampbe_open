var Districts = require('../../models/campaigns/districts')

const getCountyDistrictBounderies = async(detail) => {
    try {
        return await Districts.find({'properties.districtType': 'COUNTY'});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCountyDistrictBounderies};