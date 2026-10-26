var Organization = require('../../models/organizations/organization')

const getAllOrgsByIDs = async(data) => {
    try {
        return await Organization.find({_id : { $in : data.orgIDs }})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllOrgsByIDs}
