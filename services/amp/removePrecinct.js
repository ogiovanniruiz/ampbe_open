const ElectionPrecinct2020 = require('../../models/shapes/electionPrecinct2020')
const ElectionPrecinct2022 = require('../../models/shapes/electionPrecinct2022')
const RegistrationPrecinct = require('../../models/shapes/registrationPrecinct')

const removePrecinct = async(_id) => {
    try { 
        return await ElectionPrecinct2022.updateOne({'properties.precinctID': _id.precinctID}, {$set: {'properties.cddist':0}})

    } catch(e){
        throw new Error(e.message)
    }

}

module.exports = {removePrecinct}