const District = require('../../models/campaigns/districts')
const getCityShapes = async(data) => {
    try {

        return []

        return District.find({'properties.districtType': 'CITYWARD', 
                              'properties.identifier': 
                              {$in: ['CA_CITYWARD_SANBERNARDINOWARD1', 
                                     'CA_CITYWARD_SANBERNARDINOWARD4',
                                      'CA_CITYWARD_RIVERSIDE4',
                                      'CA_CITYWARD_RIVERSIDE7',]}})

    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getCityShapes}