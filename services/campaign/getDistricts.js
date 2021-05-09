var Districts = require('../../models/campaigns/districts')

const getDistricts = async(details) => {
    try {
        return await Districts.find({'properties.state.name': details.state.toUpperCase(),
                                     'properties.districtType': details.districtType.toUpperCase()});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getDistricts};
