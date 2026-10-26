var Membership = require('../../models/people/membership')
var {personIDQuery} = require('./memberUtils')

const getMember = async(detail) => {
    try { 
        return await Membership.findOne({'enrollment.orgID': detail.orgID, ...personIDQuery(detail.personID)})
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getMember}