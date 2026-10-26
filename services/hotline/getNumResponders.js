var Responder = require('../../models/hotline/responder')

const getNumResponders = async(detail) => {
    try { 
        return Responder.find({orgID: detail.orgID,
            location: {
              $geoWithin: {
                $centerSphere: [[detail.coordinates[0], detail.coordinates[1]], detail.radius / 6378.1] 
              }
            }
          });
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getNumResponders}