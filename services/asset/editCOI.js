var COI = require('../../models/assets/coi')

var Blockgroup = require('../../models/targets/blockgroup')

const editCOI = async(coiDetail) => {
    try { 
        var coi = await COI.findById(coiDetail.coiID)
        coi.properties = coiDetail.properties

        /*
        var bgs = await Blockgroup.find({geometry: {$geoIntersects: { $geometry: coi.geometry}}})

        var geoids = []

        for(var i = 0; i < bgs.length; i++){
            geoids.push(bgs[i].properties.geoid)
        }
        coi.properties.geoids = geoids*/

        return coi.save()
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {editCOI}