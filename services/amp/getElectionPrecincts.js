const ElectionPrecinct2020 = require('../../models/shapes/electionPrecinct2020')
const ElectionPrecinct2022 = require('../../models/shapes/electionPrecinct2022')


const getElectionPrecincts = async(data) => {
    try {

        if(data.year === "2022"){
            return await ElectionPrecinct2022.find({"properties.county": data.county, "properties.cddist": 41})
        }

        return await ElectionPrecinct2020.find({"properties.county": data.county, "properties.cddist": 41})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getElectionPrecincts}