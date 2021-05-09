var COI = require('../../models/assets/coi')

var Blockgroup = require('../../models/targets/blockgroup')

const createCOI = async(coiDetail) => {
    try { 

        var newCOI = new COI(coiDetail)
        var bgs = await Blockgroup.find({geometry: {$geoIntersects: { $geometry: newCOI.geometry}}})

        var geoids = []
        var totalPop = 0
        var totalPercentAsian = 0
        var totalPercentWhite = 0
        var totalPercentBlack = 0
        var totalPercentPI = 0
        var totalPercentHispanic = 0
        var totalPercentMale = 0
        var totalPercentFemale = 0

        for(var i = 0; i < bgs.length; i++){

            totalPop = totalPop + bgs[i].properties.demographics.totalPop

            totalPercentAsian = totalPercentAsian + bgs[i].properties.demographics.percentAsian
            totalPercentWhite = totalPercentWhite + bgs[i].properties.demographics.percentWhite
            totalPercentBlack = totalPercentBlack + bgs[i].properties.demographics.percentBlack
            totalPercentPI = totalPercentPI + bgs[i].properties.demographics.percentPI
            totalPercentHispanic = totalPercentHispanic + bgs[i].properties.demographics.percentHispanic
            totalPercentMale = totalPercentMale + bgs[i].properties.demographics.percentMale
            totalPercentFemale = totalPercentFemale + bgs[i].properties.demographics.percentFemale
            geoids.push(bgs[i].properties.geoid)
        }

        newCOI.properties.demographics.totalPop = totalPop
        newCOI.properties.demographics.percentAsian = (totalPercentAsian/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentWhite = (totalPercentWhite/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentBlack = (totalPercentBlack/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentPI = (totalPercentPI/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentHispanic = (totalPercentHispanic/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentMale = (totalPercentMale/bgs.length).toFixed(2)
        newCOI.properties.demographics.percentFemale = (totalPercentFemale/bgs.length).toFixed(2)

        newCOI.properties.geoids = geoids

        return newCOI.save()
        
    } catch(e){

        throw new Error(e.message)
       
    }
}

module.exports = {createCOI}