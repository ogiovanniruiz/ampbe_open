var CallPool = require('../../../models/organizations/swCallPool')

const forceHangUpSWPhonenumber = async(detail) => {
    try {
        return await CallPool.updateOne({orgID: detail.orgID, number: detail.phoneNumber}, {$set: {available: true}})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {forceHangUpSWPhonenumber}