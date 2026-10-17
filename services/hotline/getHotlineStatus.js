var CallPool = require('../../models/organizations/swCallPool')

const getHotlineStatus = async(detail) => {
    try { 
        return CallPool.findOne({orgID: detail.orgID, hotline_enabled: true})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getHotlineStatus}