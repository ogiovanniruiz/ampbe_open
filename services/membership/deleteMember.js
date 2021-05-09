var Membership = require('../../models/organizations/membership')


const deleteMember = async(member) => {
    try { 
        return await Membership.deleteOne({_id: member._id})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {deleteMember}