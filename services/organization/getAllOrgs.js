var Organization = require('../../models/organizations/organization')

// Used to find an organization to join: names only. Full documents carry Twilio and SignalWire credentials.
const getAllOrgs = async(detail = {}) => {
    try { 
        var orgs = await Organization.find({active: true}, {name: 1, userIDs: 1, requests: 1}).sort({name: 1}).lean()
        var userID = detail.userID ? String(detail.userID) : null

        return orgs.map(org => ({
            _id: org._id,
            name: org.name,
            status: !userID ? null
                : (org.userIDs || []).includes(userID) ? 'member'
                : (org.requests || []).includes(userID) ? 'requested'
                : null,
        }))
    } catch(e){
        throw new Error(e.message)
    }
}

module.exports = {getAllOrgs}
