var Districts = require('../../../models/campaigns/districts')
const getStateDistrict = async(detail) => {
    try {

        //console.log(detail.bounds)

        //var districts = await Districts.find({'properties.districtType': "COUNTY",  geometry: {$geoIntersects: { $geometry: detail.bounds[0].geometry}} })
        
        //var district_names = districts.map(x => {return x.properties.name})

        //console.log(district_names)

        return await Districts.findOne({'properties.name': detail.name});

      
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getStateDistrict}
