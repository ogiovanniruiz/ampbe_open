var Precinct = require('../../../models/shapes/registrationPrecinct')
const getPrecinct = async(detail) => {
    try {
        return await Precinct.findOne({"properties.precinctID": detail.precinctID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPrecinct}
