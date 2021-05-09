var Precincts = require('../../models/targets/precinct')
const getPrecinct = async(detail) => {
    try {
        return await Precincts.findOne({"properties.precinctID": detail.precinctID});
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getPrecinct}
