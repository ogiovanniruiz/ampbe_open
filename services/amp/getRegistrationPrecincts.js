const RegistrationPrecinct = require('../../models/shapes/registrationPrecinct')

const getRegistrationPrecincts = async(data) => {
    try {
        return await RegistrationPrecinct.find({"properties.county": data.county, "properties.cddist": 41})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getRegistrationPrecincts}