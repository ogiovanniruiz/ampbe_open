var COI = require('../../models/assets/coi')

const cloneCOI = async(cloneData) => {
    try { 

        var newCOI = {properties: cloneData.properties,
                      geometry: cloneData.geometry,
                      type: 'Feature'
        }

        var newCOI = new COI(newCOI)
        return newCOI.save()
        
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {cloneCOI}